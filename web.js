const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const app = express()
const cors = require('cors')

const bot = require('./bot')

const privateKey = fs.readFileSync('./sk.key', 'utf8')
const certificate = fs.readFileSync('./sk.crt', 'utf8')
const credentials = { key: privateKey, cert: certificate }

app.use(express.json())
app.use(cors())

app.post('/order', (req, res) => {
    console.log(req.body)

    let text = ''
    Object.values(req.body.products).forEach((product) => {
        text += product.name + ': ' + product.quantity + '\n'
    })

    bot.telegram.sendMessage('-1001621383069',
        'Заказ за столиком №' + req.body.table + '! ' + '\n\n' + text)

    res.send({ success: true })

})


var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

httpServer.listen(4748)
httpsServer.listen(4747, () => {
    console.log(`HTTPS Up and Running on port 4747`);
    bot.telegram.sendMessage('319121362', 'Web запущен')
})

module.exports = app