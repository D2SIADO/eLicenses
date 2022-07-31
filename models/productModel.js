const mongoose = require('mongoose')

module.exports = mongoose.model('products', new mongoose.Schema({
    name: String,
    version: String,
    createdby: String,
    download: String,
    purchases: Number,
    price: Number,
    createdat: Date
}))