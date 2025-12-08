const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: null
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        phone: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
            required: true
        },
        image: {
            type: String,
            default: null
        },
        isLocked: {
            type: Boolean,
            default: false
        }

    }, {timestamps: { createdAt: 'create_at', updatedAt: 'update_at' }}
)

const User = mongoose.model('User', userSchema)

module.exports = User;