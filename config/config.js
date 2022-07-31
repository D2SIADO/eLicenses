const config = require('./config.json')

module.exports = {
    port: config.port || 3000,
    name: config.name || "Extreme Licenses",
    mongo: {
        databaseuri: config.mongo.databaseuri
    },
    api: {
        routes: {
            license: config.api.routes.licenses || '/verify'
        },
        key: config.api.access['secret-key']
    },
    web: {
        routes: {
            web: config.web.routes.web
        }
    },
    bot: {
        token: config.bot.token,
        guild: config.bot.guildid,
        icon: config.bot.icon || "https://portfolio.d2siado.repl.co/resources/favicon.gif",
        presence: {
            enabled: config.bot.presence.enabled || true,
            type: config.bot.presence.type || "PLAYING",
            interval: config.bot.presence.interval || "1m",
            activities: config.bot.presence.activities || [ "I see Extreme Developer licenses :)",
            "My prefix are /, i use app commands",
            "Probably i got free on github/d2siado" ]
        }
    }
}