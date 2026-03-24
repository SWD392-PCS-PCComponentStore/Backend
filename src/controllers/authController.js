const UserService = require('../services/userService');

class AuthController {

    static async register(req, res) {
        try {
            const user = await UserService.register(req.body);
            res.status(201).json({ message: 'User registered successfully', user });
        }catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async login(req, res) {
        try{
            const { email, password } = req.body;
            const result = await UserService.login(email, password);

            res.status(200).json({ message: 'Login successful', token: result.token, user: result.user });
        }catch (err) {
            res.status(401).json({ error: err.message });
        }
    }

    static async googleLogin(req, res) {
        try {
            const email = req.body?.email;
            const result = await UserService.loginWithGoogleEmail(email);

            res.status(200).json({ message: 'Google login successful', token: result.token, user: result.user });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
module.exports = AuthController;