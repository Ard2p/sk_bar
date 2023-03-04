const { Markup } = require('telegraf')
const lang = require('./lang.json')
class Menu {
    constructor() {
        this.menu = {

            'start': {
                text: lang.description,
                keyboard: Markup.inlineKeyboard([[
                    // Markup.button.callback('Афиша', 'afisha'),
                    Markup.button.url('Афиша', 'https://vk.com/skbar21?w=app6819359_-64982861'),
                    Markup.button.callback('Подарок', 'gift', true),
                ], [Markup.button.callback('Бронирование', 'reservation')]])
            },

            'menu': {
                text: lang.description,
                keyboard: Markup.inlineKeyboard([[
                    // Markup.button.callback('Афиша', 'afisha'),
                    Markup.button.url('Афиша', 'https://vk.com/skbar21?w=app6819359_-64982861'),
                    Markup.button.callback('Подарок', 'gift', true),
                ], [Markup.button.callback('Бронирование', 'reservation')]])
            },

            'gift': {
                text: 'Подарок раз в 24 часа',
                keyboard: Markup.inlineKeyboard([[
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll')
                ], [
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll'),
                    Markup.button.callback('🎁', 'gift_roll')
                ]])
            },

            'afisha': {
                text: 'Инфо о близжайших эвентах',
                keyboard: Markup.inlineKeyboard([[
                    Markup.button.callback('Меню', 'menu'),
                    Markup.button.callback('Подарок', 'gift'),
                ], [Markup.button.callback('Бронирование', 'reservation')]])
            }
        }
    }

    get(ctx, slug, options = {}, del = true) {
        if (del) ctx.deleteMessage().catch(e => { })

        let menu = this.menu[slug]
        return ctx.reply(options?.text || menu.text, {
            parse_mode: 'HTML',
            ...options?.keyboard || menu.keyboard
        })
    }
}

module.exports = new Menu()