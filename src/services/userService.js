const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');


class UserService {
    static getGoogleClientId() {
        const candidates = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENTID,
            process.env.GOOGLE_OAUTH_CLIENT_ID
        ];

        const clientId = candidates.find((value) => String(value || '').trim());
        return String(clientId || '').trim();
    }

    static sanitizeUser(user) {
        if (!user) {
            return user;
        }
        const { password, ...safeUser } = user;
        return safeUser;
    }

    static generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
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
        const token = UserService.generateAccessToken(user);
        return { token, user: UserService.sanitizeUser(user) };
    }

    static async verifyGoogleIdToken(idToken) {
        const token = String(idToken || '').trim();
        if (!token) {
            throw new Error('id_token is required');
        }

        const clientId = UserService.getGoogleClientId();
        if (!clientId) {
            throw new Error('Google OAuth is not configured (missing GOOGLE_CLIENT_ID)');
        }

        const googleClient = new OAuth2Client(clientId);
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: clientId
        });

        const payload = ticket.getPayload() || {};
        if (!payload.email) {
            throw new Error('Google token does not contain email');
        }

        if (!payload.email_verified) {
            throw new Error('Google email is not verified');
        }

        const email = String(payload.email).trim().toLowerCase();
        const name = String(payload.name || '').trim() || email.split('@')[0];
        const avatar = String(payload.picture || '').trim() || null;

        return { email, name, avatar };
    }

    static async loginOrCreateFromGoogleProfile(profile) {
        let user = await User.findbyEmail(profile.email);
        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(
                randomPassword,
                parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
            );

            user = await User.create({
                name: profile.name,
                email: profile.email,
                password: hashedPassword,
                avatar: profile.avatar
            });
        }

        const token = UserService.generateAccessToken(user);
        return { token, user: UserService.sanitizeUser(user) };
    }

    static async loginWithGoogle(idToken) {
        const profile = await UserService.verifyGoogleIdToken(idToken);

        return UserService.loginOrCreateFromGoogleProfile(profile);
    }

    static async loginWithGoogleEmail(emailInput, nameInput, avatarInput) {
        const email = String(emailInput || '').trim().toLowerCase();
        if (!email) {
            throw new Error('email is required');
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            throw new Error('Only Gmail address is accepted for this quick login mode');
        }

        const name = String(nameInput || '').trim() || email.split('@')[0];
        const avatar = String(avatarInput || '').trim() || null;
        const profile = { email, name, avatar };

        return UserService.loginOrCreateFromGoogleProfile(profile);
    }

    static async loginOrRegisterByEmailPassword(emailInput, passwordInput, nameInput, avatarInput) {
        const email = String(emailInput || '').trim().toLowerCase();
        if (!email) {
            throw new Error('email is required');
        }

        const password = String(passwordInput || '').trim();
        if (!password) {
            throw new Error('password is required');
        }

        let user = await User.findbyEmail(email);
        if (!user) {
            const hashedPassword = await bcrypt.hash(
                password,
                parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
            );

            user = await User.create({
                name: String(nameInput || '').trim() || email.split('@')[0],
                email,
                password: hashedPassword,
                avatar: String(avatarInput || '').trim() || null
            });
        } else {
            const isMatch = await bcrypt.compare(password, user.password || '');
            if (!isMatch) {
                throw new Error('Invalid email or password');
            }
        }

        const token = UserService.generateAccessToken(user);
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