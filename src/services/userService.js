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

    static async updateUser(userId, userData) {
        const normalizedUserId = Number(userId);
        if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
            throw new Error('Valid user_id is required');
        }

        const existingUser = await User.findById(normalizedUserId);
        if (!existingUser) {
            throw new Error('User not found');
        }

        const nextEmail = (userData.email ?? existingUser.email)?.trim();
        if (!nextEmail) {
            throw new Error('Email is required');
        }

        if (nextEmail !== existingUser.email) {
            const emailOwner = await User.findbyEmail(nextEmail);
            if (emailOwner && emailOwner.user_id !== normalizedUserId) {
                throw new Error('Email already in use');
            }
        }

        const nextName = (userData.name ?? existingUser.name ?? '').trim();
        if (!nextName) {
            throw new Error('Name is required');
        }

        let nextPassword = existingUser.password;
        if (userData.password !== undefined) {
            if (!String(userData.password).trim()) {
                throw new Error('Password cannot be empty');
            }
            nextPassword = await bcrypt.hash(
                String(userData.password),
                parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
            );
        }

        const updatedUser = await User.update(normalizedUserId, {
            name: nextName,
            email: nextEmail,
            password: nextPassword,
            role: userData.role ?? existingUser.role,
            status: userData.status ?? existingUser.status,
            phone: userData.phone ?? existingUser.phone,
            address: userData.address ?? existingUser.address,
            avatar: userData.avatar ?? existingUser.avatar
        });

        return UserService.sanitizeUser(updatedUser);
    }

    static async createUser(userData) {
        if (!userData?.email || !String(userData.email).trim()) {
            throw new Error('Email is required');
        }
        if (!userData?.password || !String(userData.password).trim()) {
            throw new Error('Password is required');
        }

        const name = (userData.name || userData.fullname || '').trim();
        if (!name) {
            throw new Error('Name is required');
        }

        const email = String(userData.email).trim();
        const existingUser = await User.findbyEmail(email);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(
            String(userData.password),
            parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
        );

        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userData.role,
            status: userData.status,
            phone: userData.phone,
            address: userData.address,
            avatar: userData.avatar
        });

        return UserService.sanitizeUser(createdUser);
    }

    static async getAllUsers() {
        const users = await User.findAll();
        return users.map((user) => UserService.sanitizeUser(user));
    }

    static async getUserById(userId) {
        const normalizedUserId = Number(userId);
        if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
            throw new Error('Valid user_id is required');
        }

        const user = await User.findById(normalizedUserId);
        if (!user) {
            throw new Error('User not found');
        }

        return UserService.sanitizeUser(user);
    }

    static async deleteUser(userId) {
        const normalizedUserId = Number(userId);
        if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
            throw new Error('Valid user_id is required');
        }

        const deleted = await User.deleteById(normalizedUserId);
        if (!deleted) {
            throw new Error('User not found');
        }

        return { user_id: normalizedUserId };
    }
}

module.exports = UserService;