module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define('reservation', {
        tg_id: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        visitors: {
            type: Sequelize.SMALLINT,
        },
        table: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        phone: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.TINYINT,
        }
    }, {
        indexes: [{
            unique: false,
            fields: ['date', 'table']
        }]
    })

    // Reservation.prototype.createReserv = async function (options) {
    //     const res = await this.reservation.create({
    //         tg_id: options.tg_id || null,
    //         date: options.date,
    //         visitors: options.visitors,
    //         table: options.table,
    //         name: options.name,
    //         phone: options.phone,
    //         status: options.status || 0
    //     })
    //     return res
    // }

    // Reservation.prototype.getReservByDate = async function (date) {
    //     const res = await this.reservation.findAll({ where: { date: date } })
    //     return res
    // }

    return Reservation
}