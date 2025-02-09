/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const {setTimeout} = require ('node:timers/promises');
const {createScraper} = require("./scraper");

const client = new S3Client();

exports.handler = async (event, context) => {

  let scraper = createScraper();

  try {
    const buffer = await scraper.page.screenshot();

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