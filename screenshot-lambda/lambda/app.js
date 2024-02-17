/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const {setTimeout} = require ('node:timers/promises');

const pageURL = process.env.TARGET_URL
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

const client = new S3Client();

exports.handler = async (event, context) => {

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent(agent)

    console.log('Navigating to page: ', pageURL)

    await page.goto(pageURL);
    await setTimeout(2000);
    const buffer = await page.screenshot();

    // upload the image using the current timestamp as filename
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${Date.now()}.png`,
      Body: buffer,
      ContentType: 'image/png'
    });

    const response = await client.send(command);
    console.log('S3 response:', JSON.stringify(response));

    await page.close();
    await browser.close();
    
  } catch (error) {
    console.log(error)
    throw error
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}