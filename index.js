const DB = require('./models')
// const io = require('./socket')
const web = require('./web')
const bot = require('./bot')




DB.sequelize.sync().then(() => {
  console.log('Synced db.')
  bot.launch()
  // io.listen(4747)
  // let webPort = 4747
  // web.listen(webPort, () => {
  //   console.log(`Up and Running on port ${webPort}- This is Customer service`);
  // })
}).catch((err) => {
  console.log('Failed to sync db: ' + err.message)
})

