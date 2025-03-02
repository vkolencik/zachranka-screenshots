const {createScraper} = require("./scraper");
const fs = require('fs')

async function screenshot() {
    process.env.TARGET_URL = 'https://kapacita.zachranka.cz/'

    const scraper = await createScraper()
    const buffer = await scraper.page.screenshot()

    fs.writeFileSync('test.png', buffer)
    await scraper.browser.close()
}

screenshot()
    .then(() => process.exit(0))
