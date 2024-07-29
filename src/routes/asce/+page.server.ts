import { addressStore } from '$lib';
import { error } from '@sveltejs/kit';
import puppeteer, { Browser } from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import chromium from '@sparticuz/chromium';

export function load() {
    return { address: addressStore.get() };
}

export const actions = {
    'get-asce-data': async ({ request }) => {
        const form = await request.formData();
        addressStore.set(form.get('address'));

        let browser: Browser;
        try {
            console.log('Launching Puppeteer with Chromium settings...');
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless
            });

            const page = await browser.newPage();
            let downloadPath = path.resolve('./static/downloads');
            fs.mkdirSync(downloadPath, { recursive: true });

            // @ts-ignore
            await page._client().send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: downloadPath
            });

            await page.goto('https://ascehazardtool.org');
            await page.mouse.click(620, 255);
            await page.type('#geocoder_input', form.get('address') as string);
            await page.click('#locate-address');
            await page.select('#standards-selector', form.get('version') as string);
            await page.select('#risk-level-selector', form.get('risk') as string);
            await page.select('#site-soil-class-selector', form.get('soil') as string);

            let loads = ['Wind', 'Seismic', 'Ice', 'Snow', 'Rain', 'Flood', 'Tsunami', 'Tornado'];
            while (loads.length > 0) {
                let selector = loads[loads.length - 1];
                let elementExists = await page.evaluate(selector => !!document.querySelector(selector), 'label[for="' + selector + '"]');
                if (elementExists) {
                    await page.evaluate((selector) => {
                        const button = document.querySelector('#' + selector) as HTMLElement;
                        button.click();
                    }, selector);
                }
                loads.pop();
            }

            await sleep(3000);
            await page.evaluate(() => {
                const button = document.querySelector('.waves-effect.waves-light.btn-large.blue.darken-4.fill__wide') as HTMLElement;
                button.click();
            });
            await sleep(7000);

            await page.evaluate(() => {
                const button = document.querySelector('.waves-effect.waves-light.btn-large.blue.darken-4.report-button') as HTMLElement;
                button.click();
            });

            // @ts-ignore
            page._client().on('Page.downloadProgress', async (event: { state: string; }) => {
                if (event.state === 'completed') {
                    await browser.close();
                    downloadPath = path.resolve('./static/downloads/ASCEDesignHazardsReport.pdf');
                    const fileContent = fs.readFileSync(downloadPath);

                    return new Response(fileContent, {
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': `attachment; filename="${path.basename(downloadPath)}"`
                        }
                    });
                }
            });

        } catch (err) {
            console.error('Error launching Puppeteer:', err);
            throw error(500, 'Error when loading scraping page');
        }
    }
};

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
