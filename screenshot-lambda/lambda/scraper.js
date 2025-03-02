const puppeteer = require('puppeteer-core');
//const chromium = require('@sparticuz/chromium');
// const worker_threads = require("node:worker_threads");

let chromium;

try {
    console.log('Loading chromium package...');
    chromium = require('@sparticuz/chromium');
    console.log('chromium loaded');
    console.log('chromium loaded, properties:', Object.keys(chromium));
} catch (error) {
    console.error('Error loading chromium package:', error);
}

const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

const wait = (waitTimeMs) => new Promise((resolve) => setTimeout(resolve, waitTimeMs))

module.exports.createScraper = async function() {
    console.log('Creating scraper')

    try {
        const pageURL = process.env.TARGET_URL

        console.log('Creating browser')

        console.log('Chromium executable path:', await chromium.executablePath());
        console.log('Chromium args:', chromium.args);

        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        }).then(browser => {

            console.log('Browser created');

            // const page = await browser.newPage();
            // await page.setUserAgent(agent)

            console.log('Navigating to page: ', pageURL)

            // await page.goto(pageURL);
            // await wait(2000);

            return {browser, page}
        }).catch(error => {
            console.error('Browser launch error details:', error.message);
            // Also log the stack trace
            console.error(error.stack);
            throw error;
        })
            ;
    } catch (error) {
        console.error('Browser launch error details:', error.message);
        // Also log the stack trace
        console.error(error.stack);
        throw error;
    }
}
