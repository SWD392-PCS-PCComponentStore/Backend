const userBuildService = require("../services/userBuildService");

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

exports.createUserBuild = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            user_id: req.query.user_id ?? req.body.user_id
        };

        const result = await userBuildService.createUserBuild(payload);

        return res.status(201).json({
            success: true,
            message: "User build created successfully",
            data: result
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Create user build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.getMyUserBuilds = async (req, res) => {
    try {
        const data = await userBuildService.getMyUserBuilds(req.query.user_id);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Get user builds error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.getMyUserBuildById = async (req, res) => {
    try {
        const buildId = Number(req.params.id);
        const data = await userBuildService.getMyUserBuildById(buildId);

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "User build not found"
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Get user build by id error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.updateMyUserBuild = async (req, res) => {
    try {
        const buildId = Number(req.params.id);
        const data = await userBuildService.updateMyUserBuild(buildId, req.body);

        return res.json({
            success: true,
            message: "User build updated successfully",
            data
        });
    } catch (error) {
        if (error.message === "User build not found") {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Update user build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.deleteMyUserBuild = async (req, res) => {
    try {
        const buildId = Number(req.params.id);
        const result = await userBuildService.deleteMyUserBuild(buildId);

        return res.json({
            success: true,
            message: "User build deleted successfully",
            data: result
        });
    } catch (error) {
        if (error.message === "User build not found") {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Delete user build error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.addItem = async (req, res) => {
    try {
        const result = await userBuildService.addItemToBuild(Number(req.params.id), req.body);
        return res.status(201).json({
            success: true,
            message: "Item added to user build",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Add user build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const result = await userBuildService.updateBuildItem(
            Number(req.params.id),
            Number(req.params.itemId),
            req.body
        );

        return res.json({
            success: true,
            message: "User build item updated",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error("Update user build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const result = await userBuildService.deleteBuildItem(
            Number(req.params.id),
            Number(req.params.itemId)
        );

        return res.json({
            success: true,
            message: "User build item deleted",
            data: result
        });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ success: false, error: error.message });
        }

        console.error("Delete user build item error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
