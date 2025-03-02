/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

// Layer: arn:aws:lambda:eu-central-1:764866452798:layer:chrome-aws-lambda:22

const AWS = require('aws-sdk')
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const chromium = require('chrome-aws-lambda');

const pageURL = process.env.TARGET_URL
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

function getFilename() {
    return `${new Date().toISOString().replace('T', '-').replace(/:/g, '').substring(0, 17)}.png`
}

exports.handler = async (event, context) => {

    let result = null;
    let browser = null;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        let page = await browser.newPage();
        await page.setUserAgent(agent)
        await page.emulateTimezone('Europe/Prague');

        console.log('Navigating to page: ', pageURL)

        await page.goto(pageURL)
        const element = await page.$('html');        // declare a variable with an ElementHandle
        const buffer = await element.screenshot()
        result = await page.title()

        // upload the image using the current timestamp as filename
        const s3result = await s3
            .upload({
                Bucket: process.env.S3_BUCKET,
                Key: `screenshots/${getFilename()}`,
                Body: buffer,
                ContentType: 'image/png',
                ACL: 'public-read'
            })
            .promise()

        console.log('S3 image URL:', s3result.Location)

        await page.close();
        await browser.close();

    } catch (error) {
        console.log(error)
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    return result
}