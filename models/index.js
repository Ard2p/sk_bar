const config = require('../config.json')['db']

const Sequelize = require('sequelize')

const sequelize = new Sequelize(config.name, config.user, config.pass, {
    host: config.host,
    dialect: 'mysql',
    logging: false,
    //   pool: {
    //     max: dbConfig.pool.max,
    //     min: dbConfig.pool.min,
    //     acquire: dbConfig.pool.acquire,
    //     idle: dbConfig.pool.idle
    //   }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.reservation = require('./reservation.js')(sequelize, Sequelize)

module.exports = db