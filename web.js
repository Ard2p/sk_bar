const express = require('express')
const app = express()
const cors = require('cors')
const bot = require('./bot')

app.use(express.json())
app.use(cors())

app.post('/order', (req, res) => {
    console.log(req.body)

    let text = ''
    Object.values(req.body.products).forEach((product) => {
        text+= product.name + ': ' + product.quantity + '\n'
    })

    bot.telegram.sendMessage('-1001621383069',
        'Заказ за столиком №' + req.body.table + '! ' + '\n\n' + text)

    res.send({ success: true })

})

module.exports = app