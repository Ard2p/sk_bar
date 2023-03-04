const { Telegraf, session, Scenes: { Stage } } = require('telegraf')

const DB = require('./models')
const Menu = require('./menu')
const reservationScene = require('./reservationScene')

const config = require('./config.json')
const lang = require('./lang.json')

const bot = new Telegraf(config.token)

const gifts = [
  'Час караоке при заказе 3 пивных башен!',
  'Картошка фри или дольки при заказе от 1500р!',
  '1 кола в подарок при покупке 3 виски!'
]

const stage = new Stage()
stage.command('cancel', (ctx) => {
  ctx.reply('Operation canceled')
  return ctx.scene.leave()
})
stage.register(reservationScene)

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => {
  return Menu.get(ctx, 'start')
})

bot.action('menu', ctx => {
  return Menu.get(ctx, 'menu')
})

bot.action('afisha', ctx => {
  return Menu.get(ctx, 'afisha')
})

bot.action('gift', ctx => {
  return Menu.get(ctx, 'gift')
})

bot.action('reservation', ctx => {
  ctx.deleteMessage().catch(e => { })
  return ctx.scene.enter('reservation')
})

bot.action('gift_roll', async ctx => {
  ctx.deleteMessage().catch(e => { })
  gift = gifts[Math.floor(Math.random() * gifts.length)]
  return Menu.get(ctx, 'menu', { text: 'Ваш подарок: ' + gift + '\n\n' + 'Ваш купон действует на дату его получения и до закрытия бара!' })
})

bot.action(/accept_(.+)_(.+)/, async ctx => {

  let table = await DB.reservation.findOne({ where: { date: ctx.match[1], table: ctx.match[2] } })
  if (!table) return

  await DB.reservation.update({ status: 1 }, {
    where: { date: ctx.match[1], table: ctx.match[2] }
  })

  await ctx.telegram.sendMessage(table.tg_id, 'Ваша бронь на ' + table.date + ' подтверждена!')

  let text = ctx.update.callback_query.message.text
  return ctx.editMessageText(text.replace('Заявка на бронь!', 'Подтвержденная бронь!'))
})

bot.action(/delete_(.+)_(.+)/, async ctx => {

  let table = await DB.reservation.findOne({ where: { date: ctx.match[1], table: ctx.match[2] } })
  if (!table) return

  await DB.reservation.update({ status: 2 }, {
    where: {
      date: ctx.match[1],
      table: ctx.match[2]
    }
  })

  await ctx.telegram.sendMessage(table.tg_id, 'Ваша бронь на ' + table.date + ' отклонена!')

  let text = ctx.update.callback_query.message.text
  text = text.replace('Заявка на бронь!', 'Бронь отклонена!')
  text = text.replace('Подтвержденная бронь!', 'Бронь отклонена!')
  return ctx.editMessageText(text)
})




DB.sequelize.sync().then(() => {
  console.log('Synced db.')
  bot.launch()
}).catch((err) => {
  console.log('Failed to sync db: ' + err.message)
})

