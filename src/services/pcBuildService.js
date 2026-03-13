const PcBuild = require("../models/pcBuildModel");

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("items is required and must be a non-empty array");
    }

    const normalizedItems = items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity || 1)
    }));

    for (const item of normalizedItems) {
        if (!Number.isInteger(item.product_id) || item.product_id <= 0) {
            throw new Error("Each item must include a valid product_id");
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error("Each item must include a valid quantity (>= 1)");
        }
    }

    return normalizedItems;
};

const buildItemsSnapshot = async (items) => {
    const uniqueProductIds = [...new Set(items.map((item) => item.product_id))];
    const productsResult = await PcBuild.getProductsByIds(uniqueProductIds);
    const products = productsResult.recordset;

    if (products.length !== uniqueProductIds.length) {
        throw new Error("One or more products were not found");
    }

    const productMap = new Map(products.map((product) => [product.product_id, product]));

    const itemsWithSnapshot = items.map((item) => {
        const product = productMap.get(item.product_id);
        return {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: parseFloat(product.price),
            subtotal: parseFloat((parseFloat(product.price) * item.quantity).toFixed(2)),
            product_name: product.name
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

const mapBuildDetail = async (pcBuildId) => {
    const buildResult = await PcBuild.getPcBuildById(pcBuildId);
    const build = buildResult.recordset[0];

    if (!build) {
        return null;
    }

    const itemsResult = await PcBuild.getPcBuildItems(pcBuildId);
    const items = itemsResult.recordset.map((item) => ({
        ...item,
        unit_price: parseFloat(item.unit_price),
        subtotal: parseFloat((parseFloat(item.unit_price) * item.quantity).toFixed(2))
    }));

    const totalPrice = parseFloat(
        items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
    );

    return {
        pc_build: {
            pc_build_id: build.pc_build_id,
            build_name: build.build_name,
            product_id: build.product_id
        },
        product: {
            product_id: build.product_id,
            name: build.product_name,
            description: build.description,
            price: parseFloat(build.total_price || 0),
            stock_quantity: build.stock_quantity,
            image_url: build.image_url,
            category_id: build.category_id,
            status: build.status,
            brand: build.brand,
            created_at: build.created_at
        },
        items,
        total_price: totalPrice
    };
};

exports.createPcBuild = async (payload) => {
    if (!payload.build_name || !payload.build_name.trim()) {
        throw new Error("build_name is required");
    }

    const normalizedItems = validateItems(payload.items);
    const { itemsWithSnapshot, totalPrice } = await buildItemsSnapshot(normalizedItems);

    const created = await PcBuild.createPcBuildWithItems({
        build_name: payload.build_name.trim(),
        description: payload.description,
        image_url: payload.image_url,
        category_id: payload.category_id,
        status: payload.status,
        brand: payload.brand,
        stock_quantity: payload.stock_quantity,
        total_price: totalPrice,
        items: normalizedItems
    });

    return {
        pc_build: created.build,
        product: created.product,
        items: itemsWithSnapshot,
        total_price: totalPrice
    };
};

exports.getAllPcBuilds = async () => {
    const result = await PcBuild.getAllPcBuilds();
    return result.recordset.map((row) => ({
        pc_build_id: row.pc_build_id,
        build_name: row.build_name,
        product_id: row.product_id,
        total_price: parseFloat(row.total_price || 0),
        item_count: row.item_count,
        status: row.status,
        brand: row.brand,
        stock_quantity: row.stock_quantity,
        image_url: row.image_url,
        category_id: row.category_id,
        created_at: row.created_at
    }));
};

exports.getPcBuildById = async (pcBuildId) => {
    return await mapBuildDetail(pcBuildId);
};

exports.updatePcBuild = async (pcBuildId, payload) => {
    const existing = await mapBuildDetail(pcBuildId);
    if (!existing) {
        throw new Error("PC build not found");
    }

    const nextBuildName = (payload.build_name || existing.pc_build.build_name || "").trim();
    if (!nextBuildName) {
        throw new Error("build_name is required");
    }

    const normalizedItems = validateItems(payload.items || existing.items);
    const { itemsWithSnapshot, totalPrice } = await buildItemsSnapshot(normalizedItems);

    await PcBuild.updatePcBuildWithItems(pcBuildId, {
        build_name: nextBuildName,
        description: payload.description ?? existing.product.description ?? "PC build assembled from selected components",
        image_url: payload.image_url ?? existing.product.image_url ?? null,
        category_id: payload.category_id ?? existing.product.category_id ?? null,
        status: payload.status ?? existing.product.status ?? "Available",
        brand: payload.brand ?? existing.product.brand ?? "Custom Build",
        stock_quantity: payload.stock_quantity ?? existing.product.stock_quantity ?? 0,
        total_price: totalPrice,
        items: normalizedItems
    });

    const updated = await mapBuildDetail(pcBuildId);

    return {
        ...updated,
        items: itemsWithSnapshot,
        total_price: totalPrice
    };
};

exports.deletePcBuild = async (pcBuildId) => {
    const existing = await mapBuildDetail(pcBuildId);
    if (!existing) {
        throw new Error("PC build not found");
    }

    const deleted = await PcBuild.deletePcBuild(pcBuildId);
    return {
        message: "PC build deleted successfully",
        ...deleted
    };
};

exports.addItemToBuild = async (pcBuildId, payload) => {
    const productId = Number(payload.product_id);
    if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("A valid product_id is required");
    }
    const quantity = Number(payload.quantity || 1);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("quantity must be a positive integer");
    }

    const productsResult = await PcBuild.getProductsByIds([productId]);
    if (!productsResult.recordset.length) {
        throw new Error("Product not found");
    }

    return await PcBuild.addItem(pcBuildId, { product_id: productId, quantity });
};

exports.updateBuildItem = async (pcBuildId, itemId, payload) => {
    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("quantity must be a positive integer");
    }
    return await PcBuild.updateItem(pcBuildId, itemId, quantity);
};

exports.deleteBuildItem = async (pcBuildId, itemId) => {
    return await PcBuild.deleteItem(pcBuildId, itemId);
};
