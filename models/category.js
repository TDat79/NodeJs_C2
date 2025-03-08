let mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true

});

module.exports=mongoose.model('category',categorySchema);