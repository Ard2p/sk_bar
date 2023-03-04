const { Markup, Composer, Scenes: { WizardScene } } = require('telegraf')
const moment = require('moment')
const Menu = require('./menu')
const DB = require('./models')

const stepDate = new Composer()
// stepDate.use((ctx) => ctx.deleteMessage().catch(e => { }))
stepDate.on('text', (ctx) => ctx.deleteMessage().catch(e => { }))
stepDate.action(/day_(.+)/, async (ctx) => {
  ctx.editMessageText('1. Укажите дату: ' + ctx.match[1])
  ctx.wizard.state.date = ctx.match[1]
  ctx.wizard.state.tg_id = ctx.update.callback_query.message.chat.id

  let tables = await DB.reservation.findAll({ where: { date: ctx.wizard.state.date, status: { [DB.Sequelize.Op.not]: 2 } } })
  ctx.wizard.state.tables = []
  tables.forEach(table => {
    ctx.wizard.state.tables.push(parseInt(table.table))
  })

  ctx.reply('2. Укажите количество гостей:', {
    ...Markup.inlineKeyboard([
      Markup.button.callback('1', 'visitors_1'),
      Markup.button.callback('2', 'visitors_2'),
      Markup.button.callback('3', 'visitors_3'),
      Markup.button.callback('4', 'visitors_4'),
      Markup.button.callback('5', 'visitors_5'),
      Markup.button.callback('6', 'visitors_6')
    ])
  })
  return ctx.wizard.next()
})

const stepVisitors = new Composer()
stepVisitors.on('text', (ctx) => ctx.deleteMessage().catch(e => { }))
stepVisitors.action(/visitors_(.+)/, (ctx) => {
  ctx.editMessageText('2. Укажите количество гостей: ' + ctx.match[1])
  ctx.wizard.state.visitors = ctx.match[1]
  ctx.reply('3. Выбирите свободный столик:', {
    ...Markup.inlineKeyboard([[
      Markup.button.callback('1', 'table_1', ctx.wizard.state.tables.includes(1)),
      Markup.button.callback('2', 'table_2', ctx.wizard.state.tables.includes(2)),
      Markup.button.callback('3', 'table_3', ctx.wizard.state.tables.includes(3)),
      Markup.button.callback('4', 'table_4', ctx.wizard.state.tables.includes(4)),
      Markup.button.callback('5', 'table_5', ctx.wizard.state.tables.includes(5)),
      Markup.button.callback('6', 'table_6')
    ], [
      Markup.button.callback('7', 'table_7', ctx.wizard.state.tables.includes(7)),
      Markup.button.callback('8', 'table_8', ctx.wizard.state.tables.includes(8)),
      Markup.button.callback('9', 'table_9', ctx.wizard.state.tables.includes(9)),
      Markup.button.callback('10', 'table_10', ctx.wizard.state.tables.includes(10)),
      Markup.button.callback('11', 'table_11', ctx.wizard.state.tables.includes(11)),
      Markup.button.callback('12', 'table_12', ctx.wizard.state.tables.includes(12))
    ], [
      Markup.button.callback('13', 'table_13', ctx.wizard.state.tables.includes(13)),
      Markup.button.callback('14', 'table_14', ctx.wizard.state.tables.includes(14)),
      Markup.button.callback('15', 'table_15', ctx.wizard.state.tables.includes(15))
    ], [
      Markup.button.callback('101', 'table_101', ctx.wizard.state.tables.includes(101)),
      Markup.button.callback('102', 'table_102', ctx.wizard.state.tables.includes(102)),
      Markup.button.callback('103', 'table_103', ctx.wizard.state.tables.includes(103)),
      Markup.button.callback('104', 'table_104', ctx.wizard.state.tables.includes(104)),
      Markup.button.callback('105', 'table_105', ctx.wizard.state.tables.includes(105)),
      Markup.button.callback('106', 'table_106', ctx.wizard.state.tables.includes(106)),
      Markup.button.callback('107', 'table_107', ctx.wizard.state.tables.includes(107))
    ]])
  })
  return ctx.wizard.next()
})

const stepTable = new Composer()
stepTable.on('text', (ctx) => ctx.deleteMessage().catch(e => { }))
stepTable.action(/table_(.+)/, (ctx) => {
  ctx.editMessageText('3. Выбирите свободный столик: ' + ctx.match[1])
  ctx.wizard.state.table = ctx.match[1]
  ctx.reply('4. Укажите ваше имя:')
  return ctx.wizard.next()
})

const stepName = new Composer()
stepName.on('text', (ctx) => {
  ctx.wizard.state.name = ctx.message.text
  ctx.reply('5. Укажите ваш телефон:')
  return ctx.wizard.next()
})

const stepPhone = new Composer()
stepPhone.on('text', async (ctx) => {
  ctx.wizard.state.phone = ctx.message.text

  // await DB.reservation.createReserv({
  //   date: ctx.wizard.state.date,
  //   visitors: ctx.wizard.state.visitors,
  //   table: ctx.wizard.state.table,
  //   name: ctx.wizard.state.name,
  //   phone: ctx.wizard.state.phone
  // })

  await DB.reservation.create({
    tg_id: ctx.wizard.state?.tg_id || null,
    date: ctx.wizard.state.date,
    visitors: ctx.wizard.state.visitors,
    table: ctx.wizard.state.table,
    name: ctx.wizard.state.name,
    phone: ctx.wizard.state.phone,
    status: ctx.wizard.state?.status || 0
  }).then(async () => {
    await ctx.telegram.sendMessage('-1001628390964',
      'Заявка на бронь! ' + '\n\n' +
      'Дата: ' + ctx.wizard.state.date + '\n' +
      'Гости: ' + ctx.wizard.state.visitors + '\n' +
      'Стол: ' + ctx.wizard.state.table + '\n' +
      'Имя: ' + ctx.wizard.state.name + '\n' +
      'Телефон: ' + ctx.wizard.state.phone, {
      ...Markup.inlineKeyboard([[
        Markup.button.callback('Подтвердить', 'accept_' + ctx.wizard.state.date + '_' + ctx.wizard.state.table),
        Markup.button.callback('Отклонить', 'delete_' + ctx.wizard.state.date + '_' + ctx.wizard.state.table)
      ]])
    })
    await ctx.reply('Спасибо ваша заявка принята!')
  }).catch(async err => {
    await ctx.reply('Похоже этот столик уже занят, попробуйте еще раз!')
  })

  ctx.scene.leave()
  return Menu.get(ctx, 'menu', {}, false)
})

const reservationScene = new WizardScene(
  'reservation',
  ctx => {
    let keyboard = [], days = []
    let day = moment()

    for (let i = 1; i <= 35; i++) {

      if (day.isoWeekday() > 3) {
        days.push(Markup.button.callback(day.format("DD.MM"), 'day_' + day.format("DD.MM")))
      }

      if (i % 7 == 0) {
        keyboard.push(days)
        days = []
      }

      day.add(1, 'd')
    }
    ctx.reply('1. Укажите дату:', {
      ...Markup.inlineKeyboard(keyboard)
    })
    return ctx.wizard.next()
  },
  stepDate,
  stepVisitors,
  stepTable,
  stepName,
  stepPhone
)

module.exports = reservationScene