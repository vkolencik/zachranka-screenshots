/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as chromium from 'chrome-aws-lambda';

const pageURL = process.env.TARGET_URL
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

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

    console.log('Navigating to page: ', pageURL)

    await page.goto(pageURL)
    const buffer = await page.screenshot()
    result = await page.title()

    // upload the image using the current timestamp as filename
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${Date.now()}.png`,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }

    console.log('S3 response:', JSON.stringify(response))

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