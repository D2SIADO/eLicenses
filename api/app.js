const express = require('express')
const config = require('../config/config')
const path = require('path')
const cookieParser = require('cookie-parser')
const chalk = require('chalk')

const licensemodel = require('../models/licenseModel')
const productmodel = require('../models/productModel')
const blacklist = require('../models/blackModel')

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
    const { licensekey, product, version } = req.body
    const authorization_key = req.headers.authorization
    if (req.body && licensekey && product && version && authorization_key) {
        check = await blacklist.findOne({ip:{ $regex : new RegExp(ip, "i") }})
        if (check) {
            res.status(401)
            return res.send({
                "status_msg": "SERVER_BLACKLISTED",
                "status_overview": "failed",
                "server_name": check.name,
                "blacklist_reason": check.reason,
                "status_code": 401
            })
        }
        if (authorization_key === config.api.key) {
            const productdb = await productmodel.findOne({name:{ $regex : new RegExp(product, "i") }})
            if (productdb) {
                const licensedb = await licensemodel.findOne({licensekey:{ $regex : new RegExp(licensekey, "i") }})
                if (licensedb) {
                    if (licensedb.product === product) {
                        if (licensedb.ipcap !== 0) {
                            if (licensedb.iplist.length > licensedb.ipcap) {
                                res.status(401)
                                return res.send({
                                    "status_msg": "MAX_IP_CAP",
                                    "status_overview": "failed",
                                    "status_code": 401
                                })
                            }
                        }
                        let ipexists = false
                        for (let i = 0; i < licensedb.iplist.length; i++) {
                            if (licensedb.iplist[i].ip === ip) {
                                ipexists = true
                            }
                        }
                        if (!ipexists) {
                            licensedb.iplist.push({
                                ip: ip,
                                date: new Date(),
                            })
                        }
                        if (licensedb.lastip !== ip) {
                            licensedb.lastip = ip
                        }
                        licensedb.totalrequests++
                        await licensedb.save()
                        res.status(200)
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
                         })
                    } else {
                        res.status(401)
                        return res.send({
                            "status_msg": "INVALID_PRODUCT",
                            "status_overview": "failed",
                            "status_code": 401
                        })
                    }
                } else {
                    res.status(401)
                    return res.send({
                        "status_msg": "INVALID_LICENSE",
                        "status_overview": "failed",
                        "status_code": 401
                    })
                }
            } else {
                res.status(401)
                return res.send({
                    "status_msg": "PRODUCT_NOT_FOUND",
                    "status_overview": "failed",
                    "status_code": 401
                })
            }
        } else {
            res.status(400)
            return res.send({
                "status_msg": "FAILED_AUTHENTICATION",
                "status_overview": "failed",
                "status_code": 400
            })
        }
    } else {
        res.status(400)
        return res.send({
            "status_msg": "INVALID_REQUEST",
            "status_overview": "failed",
            "status_code": 400
        })
    }
})

/*
 + Loading routes of the web
*/

app.use(config.web.routes.web, express.static(path.join(__dirname, '../public')))

/*
 + Listening with config port
*/
app.listen(config.port, () => {})