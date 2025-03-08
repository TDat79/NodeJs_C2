let mongoose = require('mongoose');

let productShema = mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        min: 0,
        default: 1
    },
    description: {
        type: String,
        default: ""
    },
    imgURL: {
        type: String,
        default: ""
    },
    quantity: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});


module.exports = mongoose.model('product', productShema);
