const UserBuild = require("../models/userBuildModel");

const normalizeUserId = (userId) => {
    const normalized = Number(userId);
    if (!Number.isInteger(normalized) || normalized <= 0) {
        throw new Error("user_id is required and must be a valid integer");
    }
    return normalized;
};

const normalizeUserBuildId = (userBuildId) => {
    const normalized = Number(userBuildId);
    if (!Number.isInteger(normalized) || normalized <= 0) {
        throw new Error("user_build_id must be a valid integer");
    }
    return normalized;
};

const normalizeItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("items is required and must be a non-empty array");
    }

    const normalized = items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity || 1)
    }));

    for (const item of normalized) {
        if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
            throw new Error("Each item must include a valid product_id");
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error("Each item must include a valid quantity (>= 1)");
        }
    }

    return normalized;
};

const snapshotItemsAndTotal = async (items) => {
    const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];
    const productsResult = await UserBuild.getProductsByIds(uniqueProductIds);
    const products = productsResult.recordset;

    if (products.length !== uniqueProductIds.length) {
        throw new Error("One or more products were not found");
    }

    const productMap = new Map(products.map((product) => [product.product_id, product]));

    const itemsWithSnapshot = items.map((item) => {
        const product = productMap.get(item.product_id);
        const unitPrice = parseFloat(product.price || 0);
        const subtotal = parseFloat((unitPrice * item.quantity).toFixed(2));

        return {
            product_id: item.product_id,
            quantity: item.quantity,
            product_name: product.name,
            unit_price: unitPrice,
            subtotal
        };
    });

    const totalPrice = parseFloat(
        itemsWithSnapshot.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );

    return {
        itemsWithSnapshot,
        totalPrice
    };
};

const buildDetail = async (userBuildId) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const buildResult = await UserBuild.getUserBuildById(normalizedUserBuildId);
    const build = buildResult.recordset[0];

    if (!build) {
        return null;
    }

    const itemsResult = await UserBuild.getUserBuildItems(normalizedUserBuildId);
    const items = itemsResult.recordset.map((item) => ({
        ...item,
        unit_price: parseFloat(item.unit_price || 0),
        subtotal: parseFloat((parseFloat(item.unit_price || 0) * item.quantity).toFixed(2))
    }));

    const totalPrice = parseFloat(
        items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );

    return {
        user_build_id: build.user_build_id,
        user_id: build.user_id,
        build_name: build.build_name,
        build_source: build.build_source,
        created_at: build.created_at,
        total_price: totalPrice,
        items
    };
};

exports.createUserBuild = async (payload) => {
    const userId = normalizeUserId(payload.user_id);
    const buildName = (payload.build_name || "").trim();
    if (!buildName) {
        throw new Error("build_name is required");
    }

    const normalizedItems = normalizeItems(payload.items);
    const { itemsWithSnapshot, totalPrice } = await snapshotItemsAndTotal(normalizedItems);

    const created = await UserBuild.createUserBuildWithItems({
        userId,
        buildName,
        totalPrice,
        items: normalizedItems
    });

    return {
        user_build_id: created.user_build_id,
        user_id: created.user_id,
        build_name: created.build_name,
        build_source: created.build_source,
        created_at: created.created_at,
        total_price: totalPrice,
        items: itemsWithSnapshot
    };
};

exports.getMyUserBuilds = async (userId) => {
    const normalizedUserId = normalizeUserId(userId);
    const result = await UserBuild.getUserBuildsByUserId(normalizedUserId);
    return result.recordset.map((build) => ({
        user_build_id: build.user_build_id,
        user_id: build.user_id,
        build_name: build.build_name,
        build_source: build.build_source,
        created_at: build.created_at,
        item_count: build.item_count,
        total_price: parseFloat(build.total_price || 0)
    }));
};

exports.getMyUserBuildById = async (userBuildId) => {
    const detail = await buildDetail(normalizeUserBuildId(userBuildId));
    return detail;
};

exports.updateMyUserBuild = async (userBuildId, payload) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const existing = await buildDetail(normalizedUserBuildId);
    if (!existing) {
        throw new Error("User build not found");
    }

    const buildName = (payload.build_name || existing.build_name || "").trim();
    if (!buildName) {
        throw new Error("build_name is required");
    }

    const normalizedItems = normalizeItems(payload.items || existing.items);
    const { totalPrice } = await snapshotItemsAndTotal(normalizedItems);

    await UserBuild.updateUserBuildWithItems(normalizedUserBuildId, {
        buildName,
        totalPrice,
        items: normalizedItems
    });

    return await buildDetail(normalizedUserBuildId);
};

exports.deleteMyUserBuild = async (userBuildId) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const existing = await buildDetail(normalizedUserBuildId);
    if (!existing) {
        throw new Error("User build not found");
    }

    return await UserBuild.deleteUserBuild(normalizedUserBuildId);
};

exports.addItemToBuild = async (userBuildId, payload) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const normalizedItems = normalizeItems([payload]);
    const item = normalizedItems[0];

    const productsResult = await UserBuild.getProductsByIds([item.product_id]);
    if (!productsResult.recordset.length) {
        throw new Error("Product not found");
    }

    return await UserBuild.addItem(normalizedUserBuildId, item);
};

exports.updateBuildItem = async (userBuildId, userBuildItemId, payload) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const normalizedItemId = Number(userBuildItemId);
    if (!Number.isInteger(normalizedItemId) || normalizedItemId <= 0) {
        throw new Error("user_build_item_id must be a valid integer");
    }

    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("quantity must be a positive integer");
    }

    return await UserBuild.updateItem(normalizedUserBuildId, normalizedItemId, quantity);
};

exports.deleteBuildItem = async (userBuildId, userBuildItemId) => {
    const normalizedUserBuildId = normalizeUserBuildId(userBuildId);
    const normalizedItemId = Number(userBuildItemId);
    if (!Number.isInteger(normalizedItemId) || normalizedItemId <= 0) {
        throw new Error("user_build_item_id must be a valid integer");
    }

    return await UserBuild.deleteItem(normalizedUserBuildId, normalizedItemId);
};
