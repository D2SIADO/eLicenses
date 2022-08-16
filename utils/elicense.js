const mongoose = require('mongoose')
const config = require('../config/config')
const chalk = require('chalk')

function initSystem () {
    console.log(chalk.cyan.bold('System ━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
    try {
        require("../api/app")
        console.log(`${chalk.yellow.bold('┃')} Loaded: ✅ ${chalk.yellow.bold('┃')} Api Service`);
        console.log(`${chalk.yellow.bold('┃')} Loaded: ✅ ${chalk.yellow.bold('┃')} Web Service`);
    } catch (err) {
        console.log(err)
        console.log(chalk.red(`[!] The service will be exit because the system found a error`))
        process.exit(1)
    }
    mongoose.connect(config.mongo.databaseuri).catch((err)=>{
        console.log(err)
        console.log(chalk.red(`[!] The service will be exit because the system found a error`))
        process.exit(1)
    })
    console.log(`${chalk.yellow.bold('┃')} Loaded: ✅ ${chalk.yellow.bold('┃')} DataBase`);
    console.log(chalk.cyan.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
}

module.exports = {
    initSystem: initSystem
}
