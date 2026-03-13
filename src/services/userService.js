const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


class UserService {
    static sanitizeUser(user) {
        if (!user) {
            return user;
        }
        const { password, ...safeUser } = user;
        return safeUser;
    }

    static async register(userData) {
        const existingUser = await User.findbyEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(userData.password, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10);

        const newUser = await User.create({
            name: userData.name || userData.fullname,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            address: userData.address,
            avatar: userData.avatar
        });

        return UserService.sanitizeUser(newUser);
    }
    static async login(email, password) {
        const user = await User.findbyEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.password) {
            throw new Error('User account is invalid. Please contact administrator or re-register.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token =jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { token, user: UserService.sanitizeUser(user) };
    }
}

module.exports = UserService;