const pcBuildService = require("../services/pcBuildService");

const handleClientError = (error, res) => {
    if (
        error.message.includes("required") ||
        error.message.includes("valid") ||
        error.message.includes("not found")
    ) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    return null;
};

exports.getAllPcBuilds = async (req, res) => {
    try {
        const data = await pcBuildService.getAllPcBuilds();
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get all PC builds error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.getPcBuildById = async (req, res) => {
    try {
        const result = await pcBuildService.getPcBuildById(Number(req.params.id));
        if (!result) {
            return res.status(404).json({
                success: false,
                error: "PC build not found"
            });
        }

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Get PC build by id error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.createPcBuild = async (req, res) => {
    try {
        const result = await pcBuildService.createPcBuild(req.body);
        res.status(201).json({
            success: true,
            message: "PC build created successfully",
            data: result
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Create PC build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.updatePcBuild = async (req, res) => {
    try {
        const result = await pcBuildService.updatePcBuild(Number(req.params.id), req.body);
        return res.json({
            success: true,
            message: "PC build updated successfully",
            data: result
        });
    } catch (error) {
        if (error.message === "PC build not found") {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Update PC build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.deletePcBuild = async (req, res) => {
    try {
        const result = await pcBuildService.deletePcBuild(Number(req.params.id));
        return res.json({
            success: true,
            message: result.message,
            data: {
                pc_build_id: result.pc_build_id,
                product_id: result.product_id
            }
        });
    } catch (error) {
        if (error.message === "PC build not found") {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        console.error("Delete PC build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.addItem = async (req, res) => {
    try {
        const result = await pcBuildService.addItemToBuild(Number(req.params.id), req.body);
        return res.status(201).json({
            success: true,
            message: "Item added to PC build",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }
        const handled = handleClientError(error, res);
        if (handled) return handled;
        console.error("Add PC build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const result = await pcBuildService.updateBuildItem(
            Number(req.params.id),
            Number(req.params.itemId),
            req.body
        );
        return res.json({
            success: true,
            message: "PC build item updated",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }
        const handled = handleClientError(error, res);
        if (handled) return handled;
        console.error("Update PC build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const result = await pcBuildService.deleteBuildItem(
            Number(req.params.id),
            Number(req.params.itemId)
        );
        return res.json({
            success: true,
            message: "PC build item deleted",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }
        console.error("Delete PC build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
