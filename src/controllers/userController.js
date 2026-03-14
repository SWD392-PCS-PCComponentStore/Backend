const UserService = require('../services/userService');

class UserController {
    static handleError(error, res, actionLabel) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, error: error.message });
        }

        if (
            error.message.includes('required') ||
            error.message.includes('already in use') ||
            error.message.includes('cannot be empty') ||
            error.message.includes('Valid user_id')
        ) {
            return res.status(400).json({ success: false, error: error.message });
        }

        console.error(`${actionLabel} user error:`, error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    static async create(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            return res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            return UserController.handleError(error, res, 'Create');
        }
    }

    static async getAll(req, res) {
        try {
            const users = await UserService.getAllUsers();
            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            return UserController.handleError(error, res, 'Get all');
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            return UserController.handleError(error, res, 'Get');
        }
    }

    static async update(req, res) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            return UserController.handleError(error, res, 'Update');
        }
    }

    static async delete(req, res) {
        try {
            const result = await UserService.deleteUser(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: result
            });
        } catch (error) {
            return UserController.handleError(error, res, 'Delete');
        }
    }
}

module.exports = UserController;