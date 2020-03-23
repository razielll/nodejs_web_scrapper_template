const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');


const url = 'https://www.amazon.ca/Mount-Foot-Under-Ergonomic-Footrest/dp/B01MU2E235';

async function configureBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
};


async function checkPrice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html)

    $('#priceblock_ourprice', html).each(function () {
        let dollarPrice = $(this).text();
        let currPrice = Number(dollarPrice.replace(/[^0-9.-]+/g, ''));
        console.log(`Item price ${currPrice}`);
    });
};

// Use this at check price; i.e. if if (currPrice < 300) { sendNotification(price) }
async function sendNotification(price) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'testfrom2020@gmail.com',  // my email
            pass: ''
        }
    })

    let textToSend = `Price droped to ${price}`;
    let htmlText = `<a href=\"${url}\">Link</a>`;

    let info = await transporter.sendMail({
        from: '"Price Tracker" <testfrom2020@gmail.com>',
        to: 'targetEmail@gmail.com',
        subjet: `Price droped to ${price}`,
        text: textToSend,
        html: htmlText
    });

    console.log('Meesage send :%s', info.messageId);


}

async function startTracking() {
    const page = await configureBrowser();

    // runs every 15 seconds
    let job = new CronJob('*/30 * * * * *', function () {
        checkPrice(page);
    }, null, true, null, null, true);
    job.start();
};

startTracking();


// async function monitor() {
//     let page = await configureBrowser();
//     await checkPrice(page);
// };

// monitor();