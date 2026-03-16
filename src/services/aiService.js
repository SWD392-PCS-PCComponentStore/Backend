const Groq = require("groq-sdk");

const USE_MOCK = process.env.USE_MOCK_AI === "true";

// Initialize Groq AI
const initializeAI = () => {
  if (USE_MOCK) return null;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  GROQ_API_KEY not found, falling back to mock mode.");
    return null;
  }

  return new Groq({ apiKey });
};

// ─── Mock helpers ────────────────────────────────────────────────────────────

/**
 * Parse budget from Vietnamese query string (mock, rule-based)
 * e.g. "25 triệu" → 25000000, "30tr" → 30000000
 */
const parseBudgetFromQuery = (query) => {
  const q = query.toLowerCase();

  const trMatch = q.match(/(\d+(?:[.,]\d+)?)\s*tri[eệ]u/);
  if (trMatch) return parseFloat(trMatch[1].replace(",", ".")) * 1_000_000;

  const trShort = q.match(/(\d+(?:[.,]\d+)?)\s*tr\b/);
  if (trShort) return parseFloat(trShort[1].replace(",", ".")) * 1_000_000;

  // "củ" là tiếng lóng cho "triệu" (e.g. "15 củ" = 15 triệu)
  const cuMatch = q.match(/(\d+(?:[.,]\d+)?)\s*c[uủ]\b/);
  if (cuMatch) return parseFloat(cuMatch[1].replace(",", ".")) * 1_000_000;

  const rawNum = q.match(/(\d{6,})/);
  if (rawNum) return parseInt(rawNum[1]);

  return null;
};

const detectBuildType = (query) => {
  const q = query.toLowerCase();

  // Hybrid gaming + workstation (phải check trước gaming và workstation riêng lẻ)
  if (/(game|gaming|chien game).*(3d|render|do hoa|đồ họa|workstation)|(3d|render|do hoa|đồ họa|workstation).*(game|gaming)/.test(q)) return "gaming_workstation";

  // Streaming / làm content
  if (/stream|obs|twitch|youtube.*live|phat song|phát sóng|content creator/.test(q)) return "streaming";

  // Video / ảnh editing
  if (/edit|chinh sua|chỉnh sửa|premiere|davinci|after effect|photoshop|lightroom|video clip/.test(q)) return "editing";

  // AI / Machine Learning
  if (/ai|machine learning|deep learning|lap trinh ai|lập trình ai|pytorch|tensorflow|gpu compute/.test(q)) return "ai_ml";

  // Home server / NAS
  if (/server|nas|luu tru|lưu trữ|home server|media server|plex/.test(q)) return "home_server";

  // Budget / tiết kiệm
  if (/re nhat|rẻ nhất|tiet kiem|tiết kiệm|budget|gia re|giá rẻ|don gian|đơn giản/.test(q)) return "budget";

  // Gaming
  if (/gaming|game|chien game|fps|do hoa cao|moba|aaa/.test(q)) return "gaming";

  // Workstation / đồ họa
  if (/workstation|do hoa|đồ họa|render|3d|kien truc|kiến trúc/.test(q)) return "workstation";

  // Văn phòng / học tập
  if (/van phong|văn phòng|office|lam viec|làm việc|hoc tap|học tập|hoc|word|excel|cong viec|công việc/.test(q)) return "office";

  return "gaming";
};

const mockAnalyzeRequest = (query) => {
  const budget = parseBudgetFromQuery(query);
  const buildType = detectBuildType(query);
  const purposeLabel = { gaming: "gaming", workstation: "làm việc/đồ họa", office: "văn phòng" };

  return {
    intent: "build_pc",
    buildType,
    budget,
    cpuPreference: buildType === "office" ? "budget" : "performance",
    gpuPreference: buildType === "office" ? "none" : "performance",
    storageSize: 500,
    confidence: budget ? 0.9 : 0.6,
    explanation: budget
      ? `[MOCK] Build PC ${purposeLabel[buildType]} với ngân sách ${budget.toLocaleString("vi-VN")}đ`
      : "[MOCK] Không tìm thấy ngân sách trong yêu cầu",
    mock: true,
  };
};

const mockGenerateExplanation = (build) => {
  const purposeMap = { gaming: "gaming", workstation: "làm việc / đồ họa", office: "văn phòng" };
  const label = purposeMap[build.purpose] || build.purpose;
  const score = build.compatibility?.compatibility_score ?? "N/A";
  const total = build.estimated_total_cost
    ? build.estimated_total_cost.toLocaleString("vi-VN") + "đ"
    : "N/A";
  const over = build.cost_over_budget > 0
    ? ` (vượt ngân sách ${build.cost_over_budget.toLocaleString("vi-VN")}đ)`
    : "";

  return `[MOCK] Đây là bộ PC ${label} được tối ưu trong ngân sách. Tổng chi phí: ${total}${over}. Điểm tương thích: ${score}/100.`;
};

// ─── Groq AI call helper ──────────────────────────────────────────────────────

const callGroq = async (groq, messages, model = "llama-3.3-70b-versatile") => {
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 512,
  });
  return response.choices[0].message.content.trim();
};

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Parse user query → intent, budget, buildType, preferences
 */
const analyzeRequest = async (query) => {
  if (USE_MOCK) {
    console.log("🤖 [MOCK MODE] analyzeRequest");
    return mockAnalyzeRequest(query);
  }

  const groq = initializeAI();
  if (!groq) {
    console.log("⚠️  No AI available, using mock analyzeRequest");
    return mockAnalyzeRequest(query);
  }

  try {
    const text = await callGroq(groq, [
      {
        role: "system",
        content: `You are an AI assistant for a Vietnamese PC Component Store. Analyze the user's request and respond ONLY with a valid JSON object (no markdown, no extra text).

Extract:
1. "intent": one of [build_pc, check_build, recommendations, validate_pair, auto_build]
2. "buildType": one of the following - choose the BEST match:
   - "gaming"             → chơi game thuần túy (FPS, MOBA, AAA)
   - "workstation"        → đồ họa 3D, CAD, render, thiết kế
   - "gaming_workstation" → vừa chơi game vừa làm 3D/render/đồ họa
   - "streaming"          → gaming + stream, làm content trên OBS/Streamlabs
   - "editing"            → chỉnh sửa video/ảnh (Premiere, DaVinci, Photoshop)
   - "ai_ml"              → AI, Machine Learning, deep learning, lập trình AI
   - "office"             → văn phòng, học tập, word/excel/web, không cần GPU rời
   - "home_server"        → NAS, home server, lưu trữ dữ liệu
   - "budget"             → build rẻ nhất có thể, tiết kiệm tối đa
3. "budget": number in VND (e.g. "25 triệu" = 25000000, "20tr" = 20000000, "15 củ" = 15000000)
4. "cpuPreference": one of [budget, balanced, performance]
5. "gpuPreference": one of [none, budget, balanced, performance] — use "none" for office/home_server
6. "storageSize": number in GB - default 500
7. "confidence": 0-1
8. "explanation": one-line Vietnamese explanation

Example: {"intent":"build_pc","buildType":"gaming_workstation","budget":40000000,"cpuPreference":"performance","gpuPreference":"performance","storageSize":1000,"confidence":0.95,"explanation":"Build PC vừa chơi game vừa render 3D với ngân sách 40 triệu"}`,
      },
      { role: "user", content: query },
    ]);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      intent: parsed.intent || "build_pc",
      buildType: parsed.buildType || "gaming",
      budget: parsed.budget || null,
      cpuPreference: parsed.cpuPreference || "balanced",
      gpuPreference: parsed.gpuPreference || "performance",
      storageSize: parsed.storageSize || 500,
      confidence: parsed.confidence || 0.7,
      explanation: parsed.explanation || "Đã phân tích yêu cầu của bạn",
    };
  } catch (error) {
    console.error("Error analyzing request with Groq:", error.message);
    console.log("⚠️  Falling back to mock analyzeRequest");
    return mockAnalyzeRequest(query);
  }
};

/**
 * Generate Vietnamese explanation for a completed build
 */
const generateBuildExplanation = async (query, build) => {
  if (USE_MOCK) {
    console.log("🤖 [MOCK MODE] generateBuildExplanation");
    return mockGenerateExplanation(build);
  }

  const groq = initializeAI();
  if (!groq) return mockGenerateExplanation(build);

  try {
    const componentsText = Object.entries(build.components)
      .map(([key, comp]) => {
        const price = comp.price ? comp.price.toLocaleString("vi-VN") + "đ" : "N/A";
        return `- ${key.toUpperCase()}: ${comp.product_name} (${price})`;
      })
      .join("\n");

    const totalCost = build.estimated_total_cost
      ? build.estimated_total_cost.toLocaleString("vi-VN") + "đ"
      : "N/A";
    const score = build.compatibility?.compatibility_score ?? "N/A";

    const text = await callGroq(groq, [
      {
        role: "system",
        content: "Bạn là chuyên gia tư vấn PC tại cửa hàng Việt Nam. Hãy viết 3-4 câu tiếng Việt thân thiện để giải thích cấu hình PC được đề xuất. Chỉ trả về đoạn văn, không dùng markdown.",
      },
      {
        role: "user",
        content: `Khách yêu cầu: "${query}"

Cấu hình đề xuất:
${componentsText}

Tổng chi phí: ${totalCost} | Ngân sách: ${build.budget_total?.toLocaleString("vi-VN")}đ | Điểm tương thích: ${score}/100

Viết 3-4 câu giải thích lý do chọn cấu hình này, điểm mạnh và lưu ý nếu có.`,
      },
    ]);

    return text;
  } catch (error) {
    console.error("Error generating explanation with Groq:", error.message);
    return mockGenerateExplanation(build);
  }
};

/**
 * Full orchestration: parse → auto-build → explain
 */
const orchestrateBuildPC = async (query) => {
  const analysis = await analyzeRequest(query);

  if (!analysis.budget) {
    throw new Error(
      "Vui lòng cho biết ngân sách. Ví dụ: 'Build PC gaming 25 triệu' hoặc 'PC workstation 40 triệu'"
    );
  }

  // Map buildType → purpose + default preferences
  const BUILD_TYPE_CONFIG = {
    gaming:             { purpose: "gaming",             cpuPref: "performance", gpuPref: "performance" },
    workstation:        { purpose: "workstation",        cpuPref: "performance", gpuPref: "balanced"    },
    gaming_workstation: { purpose: "gaming_workstation", cpuPref: "performance", gpuPref: "performance" },
    streaming:          { purpose: "streaming",          cpuPref: "performance", gpuPref: "performance" },
    editing:            { purpose: "editing",            cpuPref: "performance", gpuPref: "balanced"    },
    ai_ml:              { purpose: "ai_ml",              cpuPref: "performance", gpuPref: "performance" },
    office:             { purpose: "office",             cpuPref: "balanced",    gpuPref: "none"        },
    home_server:        { purpose: "home_server",        cpuPref: "balanced",    gpuPref: "none"        },
    budget:             { purpose: "budget",             cpuPref: "budget",      gpuPref: "budget"      },
  };

  const config = BUILD_TYPE_CONFIG[analysis.buildType] || BUILD_TYPE_CONFIG.gaming;

  const preferences = {
    purpose:       config.purpose,
    cpuPreference: analysis.cpuPreference || config.cpuPref,
    gpuPreference: analysis.gpuPreference || config.gpuPref,
    storageSize:   analysis.storageSize || 500,
  };

  const AutoBuildService = require("./autoBuildService");
  const buildResult = await AutoBuildService.autoBuild(analysis.budget, preferences);

  if (!buildResult.success) {
    throw new Error(
      buildResult.error ||
        "Không thể tạo cấu hình PC. Kiểm tra lại ngân sách hoặc thêm sản phẩm vào hệ thống."
    );
  }

  const explanation = await generateBuildExplanation(query, buildResult.build);

  return { query, analysis, build: buildResult.build, explanation };
};

/**
 * Generate general product recommendations (no auto-build)
 */
const generateRecommendations = async (requirements) => {
  if (USE_MOCK) {
    return {
      requirements,
      budget: "Liên hệ cửa hàng để được tư vấn",
      components: [
        { type: "CPU", name: "Intel Core i5-13600K", reason: "[MOCK] Hiệu năng tốt tầm giá" },
        { type: "GPU", name: "RTX 4070", reason: "[MOCK] Phù hợp gaming 1440p" },
      ],
      mock: true,
    };
  }

  const groq = initializeAI();
  if (!groq) throw new Error("GROQ_API_KEY not configured");

  try {
    const text = await callGroq(groq, [
      {
        role: "system",
        content: `You are a PC expert. Recommend components and respond ONLY with valid JSON:
{"requirements":"...","budget":"range","components":[{"type":"CPU","name":"...","reason":"..."},{"type":"Mainboard","name":"...","reason":"..."},{"type":"GPU","name":"...","reason":"..."},{"type":"RAM","name":"...","reason":"..."},{"type":"Storage","name":"...","reason":"..."},{"type":"PSU","name":"...","reason":"..."},{"type":"Cooler","name":"...","reason":"..."},{"type":"Case","name":"...","reason":"..."}]}`,
      },
      { role: "user", content: `Recommend PC components for: "${requirements}"` },
    ]);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse recommendations as JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error generating recommendations:", error.message);
    throw error;
  }
};

/**
 * Test Groq API connection
 */
const testConnection = async () => {
  if (USE_MOCK) {
    return {
      success: true,
      message: "✅ Running in MOCK mode - no real API calls",
      mode: "MOCK",
      timestamp: new Date().toISOString(),
    };
  }

  const groq = initializeAI();
  if (!groq) {
    return {
      success: false,
      message: "❌ GROQ_API_KEY not configured",
      mode: "NO_KEY",
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const text = await callGroq(groq, [
      { role: "user", content: "Say 'Groq API is working' in one sentence." },
    ]);

    return {
      success: true,
      message: text,
      mode: "GROQ",
      model: "llama-3.3-70b-versatile",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      mode: "ERROR",
      hint: "Set USE_MOCK_AI=true in .env to test without real API calls",
      timestamp: new Date().toISOString(),
    };
  }
};

module.exports = {
  initializeAI,
  analyzeRequest,
  generateRecommendations,
  generateBuildExplanation,
  orchestrateBuildPC,
  testConnection,
};
