const staffBuildRequestService = require('../services/staffBuildRequestService');

const handleClientError = (error, res) => {
    if (
        error.message.includes('required') ||
        error.message.includes('valid') ||
        error.message.includes('must be')
    ) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    return null;
};

exports.getAllStaffBuildRequests = async (req, res) => {
    try {
        const data = await staffBuildRequestService.getAllStaffBuildRequests(req.query);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Get staff build requests error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.getStaffBuildRequestsByUserId = async (req, res) => {
    try {
        const data = await staffBuildRequestService.getStaffBuildRequestsByUserId(req.params.userId);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Get staff build requests by user id error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.getStaffBuildRequestById = async (req, res) => {
    try {
        const data = await staffBuildRequestService.getStaffBuildRequestById(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Staff build request not found'
            });
        }

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Get staff build request by id error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.createStaffBuildRequest = async (req, res) => {
    try {
        const data = await staffBuildRequestService.createStaffBuildRequest(req.body);
        return res.status(201).json({
            success: true,
            message: 'Staff build request created successfully',
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id, staff_id, or user_build_id'
            });
        }

        console.error('Create staff build request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.createMyStaffBuildRequest = async (req, res) => {
    try {
        const data = await staffBuildRequestService.createMyStaffBuildRequest(req.user.userId, req.body);
        return res.status(201).json({
            success: true,
            message: 'Staff build request created successfully',
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Create my staff build request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.getMyStaffBuildRequests = async (req, res) => {
    try {
        const data = await staffBuildRequestService.getMyStaffBuildRequests(req.user.userId);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Get my staff build requests error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.getMyAssignedRequests = async (req, res) => {
    try {
        const data = await staffBuildRequestService.getMyAssignedRequests(req.user.userId, req.query);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Get my assigned requests error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.assignStaffBuildRequest = async (req, res) => {
    try {
        const data = await staffBuildRequestService.assignStaffBuildRequest(req.params.id, req.user.userId);
        return res.json({
            success: true,
            message: 'Staff build request assigned successfully',
            data
        });
    } catch (error) {
        if (error.message === 'Staff build request not found') {
            return res.status(404).json({ success: false, error: error.message });
        }

        if (error.message.includes('another staff')) {
            return res.status(403).json({ success: false, error: error.message });
        }

        if (error.message.includes('already')) {
            return res.status(409).json({ success: false, error: error.message });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Assign staff build request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.submitBuildForRequest = async (req, res) => {
    try {
        const data = await staffBuildRequestService.submitBuildForRequest(
            req.params.id,
            req.user.userId,
            req.body
        );

        return res.json({
            success: true,
            message: 'Build submitted successfully',
            data
        });
    } catch (error) {
        if (error.message === 'Staff build request not found') {
            return res.status(404).json({ success: false, error: error.message });
        }

        if (error.message.includes('another staff')) {
            return res.status(403).json({ success: false, error: error.message });
        }

        if (error.message.includes('already')) {
            return res.status(409).json({ success: false, error: error.message });
        }

        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Submit build for request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.updateStaffBuildRequest = async (req, res) => {
    try {
        const data = await staffBuildRequestService.updateStaffBuildRequest(req.params.id, req.body);
        return res.json({
            success: true,
            message: 'Staff build request updated successfully',
            data
        });
    } catch (error) {
        if (error.message === 'Staff build request not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        if (error.message && error.message.toLowerCase().includes('foreign key')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id, staff_id, or user_build_id'
            });
        }

        console.error('Update staff build request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

exports.deleteStaffBuildRequest = async (req, res) => {
    try {
        const result = await staffBuildRequestService.deleteStaffBuildRequest(req.params.id);
        return res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.message === 'Staff build request not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        const handled = handleClientError(error, res);
        if (handled) return handled;

        console.error('Delete staff build request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
