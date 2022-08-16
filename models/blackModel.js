const mongoose = require('mongoose')

module.exports = mongoose.model('blacklist', new mongoose.Schema ({
    name: String,
    ip: String,
    reason: String
}))