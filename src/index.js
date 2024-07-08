const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);

const SAVE_FILE_FOR_EACH_YEAR = true;

const startYear = 2076;
const endYear = 2081;

const RECORDS_OF_YEAR = [];
for (let y = startYear; y <= endYear; y++) {
  RECORDS_OF_YEAR.push(y);
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const getHost = (year, month) => `https://www.hamropatro.com/calendar/${year}/${month}/`;

const scrapHamroPatro = async function scrapHamroPatro(page) {
  return async function (host) {
    console.log(`Fetching ${host}`);
    await page.goto(host);
    const bodyHandle = await page.$('body');
    const body = await page.evaluate(body => {
      const tableOfNepEngNums = new Map([
        ['०', 0], ['१', 1], ['२', 2], ['३', 3], ['४', 4],
        ['५', 5], ['६', 6], ['७', 7], ['८', 8], ['९', 9],
      ]);

      function nepToEngNum(strNum) {
        return String(strNum).split('').map(ch => {
          return ch === '.' || ch === ',' ? ch : tableOfNepEngNums.get(ch);
        }).join('');
      }

      const days = Array.from(
        body.querySelectorAll('.calendar .dates li:not(.disable)')
      ).map(item => ({
        isHoliday: item.classList.contains('holiday'),
        tithi: (item.querySelector('span.tithi') || {}).innerText || "",
        event: (item.querySelector('span.event') || {}).innerText || "",
        day: (item.querySelector('span.nep') || {}).innerText || "",
        dayInEn: nepToEngNum((item.querySelector('span.nep') || {}).innerText || ""),
        en: (item.querySelector('span.eng') || {}).innerText || "",
      }));

      return days;
    }, bodyHandle);

    return body;
  };
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrap = scrapHamroPatro(page);

  try {
    for (const year of RECORDS_OF_YEAR) {
      let yearData = [];
      for (const month of MONTHS) {
        const days = await scrap(getHost(year, month));
        yearData.push({ month, days });
      }
      if (SAVE_FILE_FOR_EACH_YEAR) {
        await writeFileAsync(`data/years/${year}.json`, JSON.stringify(yearData));
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }

  if (!SAVE_FILE_FOR_EACH_YEAR) {
    const allData = {};
    for (const year of RECORDS_OF_YEAR) {
      const yearFilePath = `data/years/${year}.json`;
      const yearData = JSON.parse(await readFileAsync(yearFilePath));
      allData[year] = yearData;
    }
    await writeFileAsync('data/data.json', JSON.stringify(allData));
  }

  const directoryPath = './data/years/';

  try {
    const files = await readdirAsync(directoryPath);
    let mergedData = [];

    for (const file of files) {
      if (path.extname(file) === '.json') {
        const filePath = path.join(directoryPath, file);
        const rawData = await readFileAsync(filePath);
        const jsonData = JSON.parse(rawData);
        const year = path.basename(file, '.json');

        jsonData.forEach(monthData => {
          monthData.year = parseInt(year, 10);
        });

        mergedData.push(...jsonData);
      }
    }

    await writeFileAsync('data/data.json', JSON.stringify(mergedData, null, 2));
    console.log('JSON files merged successfully!');
  } catch (err) {
    console.error('Unable to process files:', err);
  }
})();
