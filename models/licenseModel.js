const mongoose = require('mongoose')

module.exports = mongoose.model('licenses', new mongoose.Schema ({
    product: String,
    licensekey: String,
    clientname: String,
    discordid: String,
    discordname: String,
    discordtag: String,
    iplist: [{
        ip: String,
        date: Date,
        _id: false
    }],
    ipcap: Number,
    totalrequests: {
        type: Number,
        default: 0
    },
    createdby: String,
    createdat: Date,
    lastip: {
        type: String,
        default: ""
    }
}))