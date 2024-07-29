import { addressStore } from '$lib';
import {error} from '@sveltejs/kit';
import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import fs from 'fs';

export function load() {
    return {address: addressStore.get()}
};

export const actions = {
    'get-asce-data' : async({request}) => {
        // gets information entered by the user
        const form = await request.formData();

        addressStore.set(form.get('address'));

        let browser: Browser;
        try {
            // starts browser and goes to asce
            browser = await puppeteer.launch({
                headless: true,
            });
            const page = await browser.newPage();
            // sets up download path
            let downloadPath = path.resolve('./static/downloads');
            fs.mkdirSync(downloadPath, {recursive: true});
            // @ts-ignore
            await page._client().send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath
            });

            await page.goto('https://ascehazardtool.org');
            // close welcome window
            await page.mouse.click(620, 255);
            // enter address
            await page.type('#geocoder_input', form.get('address') as string);
            await page.click('#locate-address');
            // enter form data
            await page.select('#standards-selector', form.get('version') as string);
            await page.select('#risk-level-selector', form.get('risk') as string);
            await page.select('#site-soil-class-selector', form.get('soil') as string);
            //let loads = form.getAll('load');
            let loads = ['Wind', 'Seismic', 'Ice', 'Snow', 'Rain', 'Flood', 'Tsunami', 'Tornado'];
            while (loads.length > 0) {
                let selector = loads[loads.length - 1];
                let elementExists = await page.evaluate(selector => !!document.querySelector(selector), 'label[for="'+selector+'"]');
                if (elementExists) {
                    await page.evaluate((selector) => {
                        const button = document.querySelector('#' + selector) as HTMLElement;
                        button.click();
                    }, selector);
                };
                loads.pop();
            };
            // load new page
            await sleep(3000);
            await page.evaluate(() => {
                const button = document.querySelector('.waves-effect.waves-light.btn-large.blue.darken-4.fill__wide') as HTMLElement;
                button.click();
            });
            await sleep(7000);
            
            // get report
            await page.evaluate(() => {
                const button = document.querySelector('.waves-effect.waves-light.btn-large.blue.darken-4.report-button') as HTMLElement;
                button.click();
            });
            // closes browser and sends file
            // @ts-ignore
            page._client().on('Page.downloadProgress', async(event: { state: string; }) => {
                if (event.state === 'completed') {
                    // file has been downloaded
                    await browser.close();
                    downloadPath = path.resolve('./static/downloads/ASCEDesignHazardsReport.pdf');
                    const fileContent = fs.readFileSync(downloadPath);

                    return new Response(fileContent, {
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="${path.basename(downloadPath)}"`
                        }
                    });
                };
            });

        } catch {
            error(200, 'Error when loading scraping page');
        };
    }
};

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
};