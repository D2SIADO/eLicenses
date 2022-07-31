const express = require('express')
const config = require('../config/config')
const path = require('path')
const cookieParser = require('cookie-parser')
const functions = require('../utils/functions')
const chalk = require('chalk')

const licensemodel = require('../models/licenseModel')
const productmodel = require('../models/productModel')

const app = express()

/*
 + Loading config for the server...
*/
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

/*
 + Loading routes of the server
*/

app.post(config.api.routes.license, async(req, res)=> {
    const ip = (req.header('x-forwarded-for') || req.connection.remoteAddress).replace('::ffff:', '')
    const { keylicense, productname, version } = req.body
    const authorization_key = req.headers.authorization
    if (!req.body || !keylicense || !productname || !version || !authorization_key) {
        console.log(chalk.red(`[-] I recieve a invalid request from ${ip}`))
        return res.send({
            "status_msg": "INVALID_REQUEST",
            "status_overview": "failed",
            "status_code": 400
        })
    }
    if (!(authorization_key === config.api.key)) return res.send({
        "status_msg": "FAILED_AUTHENTICATION",
        "status_overview": "failed",
        "status_code": 400
    })
    const productdb = await productmodel.findOne({
        name: productname
    })
    if (!productdb) return res.send({
    "status_msg": "PRODUCT_NOT_FOUND",
    "status_overview": "failed",
    "status_code": 401
    });
    const licensedb = await licensemodel.findOne({ keylicense });
    if (!licensedb) return res.send({
        "status_msg": "INVALID_LICENSEKEY",
        "status_overview": "failed",
        "status_code": 401
    });
    if (!(licensedb.productname === productname)) return res.send({
        "status_msg": "INVALID_PRODUCT",
        "status_overview": "failed",
        "status_code": 401
    });
    if (licensedb.iplist.length > licensedb.ipcap) return res.send({
        "status_msg": "MAX_IP_CAP",
        "status_overview": "failed",
        "status_code": 401 
    });
    let ipexists = false;
    for (let i = 0; i < licensedb.iplist.length; i++) {
        if (licensedb.iplist[i].ip === ip) {
            ipexists = true;
        }
    }
    if (!ipexists) {
        licensedb.iplist.push({
            ip: ip,
            date: new Date(),
        });
    }
    if (licensedb.lastip !== ip) {
        licensedb.lastip = ip;
    }
    licensedb.totalrequests++;
    await licensedb.save();
    return res.send({
        "status_msg": "SUCCESSFUL_AUTHENTICATION",
        "status_overview": "success",
        "status_code": 200,
        "status_id": "SUCCESS",
        "version": productdb.version,
        "clientname": licensedb.clientname,
        "discordname": licensedb.discordname,
        "discordtag": licensedb.discordtag,
        "discordid": licensedb.discordid
    });
})

/*
 + Loading routes of the web
*/

app.use(config.web.routes.web, express.static(path.join(__dirname, '../public')))

/*
 + Listening with config port
*/
app.listen(config.port, () => {})
