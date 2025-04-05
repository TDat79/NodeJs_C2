const User = require('../models/users');
const Role = require('../models/roles');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const constants = require('../Utils/constants');

module.exports = {
    getUserById: async function (id) {
        return await User.findById(id).populate("role");
    },
    
    getUserByEmail: async function (email) {
        return await User.findOne({
            email: email
        }).populate("role");
    },
    
    getUserByToken: async function (token) {
        return await User.findOne({
            resetPasswordToken: token
        }).populate("role");
    },
    
    createUser: async function (username, password, email, roleName) {
        try {
            // Kiểm tra username và email đã tồn tại
            const existingUser = await User.findOne({ 
                $or: [
                    { username: username },
                    { email: email }
                ]
            });
            
            if (existingUser) {
                throw new Error("Username hoặc email đã tồn tại");
            }

            // Tìm role
            const role = await Role.findOne({ roleName: roleName });
            if (!role) {
                throw new Error(`Role ${roleName} không tồn tại`);
            }

            // Tạo user mới
            const newUser = new User({
                username,
                password,
                email,
                role: role._id,
            });

            await newUser.save();
            return newUser;
        } catch (error) {
            throw error;
        }
    },
    
    checkLogin: async function (username, password) {
        try {
            if (!username || !password) {
                throw new Error("Username và password là bắt buộc");
            }

            const user = await User.findOne({ username }).populate('role');
            if (!user) {
                throw new Error("Username hoặc password không chính xác");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error("Username hoặc password không chính xác");
            }

            // Tạo token
            const token = jwt.sign({
                id: user._id,
                expireIn: Date.now() + 30 * 60 * 1000 // 30 phút
            }, constants.SECRET_KEY);

            return token;
        } catch (error) {
            throw error;
        }
    }
};