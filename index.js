const olx="https://www.olx.ua/d/uk/elektronika/telefony-i-aksesuary/mobilnye-telefony-smartfony/q-iphone/?currency=UAH&search%5Border%5D=created_at%3Adesc&search%5Bfilter_enum_mobile_phone_manufacturer%5D%5B0%5D=2065&page="
const cheerio = require('cheerio');
const olxObyav='https://www.olx.ua'
const superagent = require('superagent');
const fs = require("fs");
const { Telegraf } = require('telegraf')
const schedule = require('node-schedule');
async function all() {
    async function test() {
        const massive=[]
        const jso = await JSON.parse(fs.readFileSync('save.json', 'utf-8'))
        const bot = new Telegraf('5420616125:AAF3r-6-VD6SlgXb8elWuU6rUG4zfC_YKcs')
        for (let k = 1; k <= 1; k++) {
            const site = await superagent.get(`${olx}${k}`)
            const html = await cheerio.load(site.text)
            const href = 'a.css-1bbgabe'
            const name = '.css-r9zjja-Text.eu5v0x0'
            const date = '.css-19yf5ek'
            const price = '.css-dcwlyx'
            const mass = []
            await html(href).each((idx, el) => {
                    mass.push(el.attribs['href'])
                }
            )
            for (let i = 0; i < mass.length; i++) {
                const site = await superagent.get(`${olxObyav}${mass[i]}`)
                const htmlObyav = await cheerio.load(site.text)
                const priceOb = await htmlObyav(price).find('h3').text()
                const nameOb = await htmlObyav(name).text().toLowerCase()
                const num = parseInt(priceOb.replace('грн.', '').replace(' ', '')) || null
                if (num) {
                    if (nameOb.indexOf("iphone 8") != -1 && num >= 4000 && num <= 6000 ||
                        nameOb.indexOf("iphone xr") != -1 && num >= 6800 && num <= 8200 ||
                        nameOb.indexOf("iphone x") != -1 && num >= 5000 && num <= 7000 ||
                        nameOb.indexOf("iphone xs") != -1 && num >= 6800 && num <= 8500
                    ) {
                        const dateOb = await htmlObyav(date).text()
                        if (jso.findIndex(el => el.link == `${olxObyav}${mass[i]}`) == -1) {
                            massive.push({
                                name: nameOb,
                                date: dateOb,
                                price: priceOb,
                                link: `${olxObyav}${mass[i]}`
                            })
                            jso.push({
                                name: nameOb,
                                date: dateOb,
                                price: priceOb,
                                link: `${olxObyav}${mass[i]}`
                            })
                        }
                    }
                }
            }
        }
        if (massive.length > 0) {
            await bot.telegram.sendMessage('-638936866', massive);
            await fs.writeFileSync('save.json', JSON.stringify(jso))
        }
    }

    test()
}

const job = schedule.scheduleJob('*/5 * * * *', async function(){
    await all()
    console.log('success');
});