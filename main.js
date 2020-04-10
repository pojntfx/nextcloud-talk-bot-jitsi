const NextcloudTalkBot = require("./src/nextcloudTalkBot");
const Jitsi = require("@pojntfx/jitsi-meet-node-client/dist");
const crypto = require("crypto");
const log = require("pino")();

const main = async () => {
  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;
  const nxtalkproxydAddr = process.env.NXTALK_PROXYD_ADDR;
  const passwordLength = process.env.JITSI_PASSWORD_LENGTH;

  log.info(`starting WebRTC node subsystem with timeout ${sleepTime} seconds`);

  await jitsi.open();

  try {
    bot = new NextcloudTalkBot(nxtalkproxydAddr);
  } catch {
    console.log("oh no");
  }

  log.info(`connecting to nxtalkproxyd with address ${nxtalkproxydAddr}`);

  return await bot.readChats(async (chat) => {
    log.info(
      `received message from "${chat.getActordisplayname()}" ("${chat.getActorid()}") in room "${chat.getToken()}" with ID "${chat.getId()}": "${JSON.stringify(
        chat.getMessage()
      )}`
    );

    const message = chat.getMessage();

    if (!/^#(videochat|videocall)/.test(message)) {
      return;
    }

    const token = chat.getToken();
    const actorID = chat.getActorid();
    const password = crypto
      .randomBytes(parseInt(passwordLength))
      .toString("hex");

    log.info(
      `"${chat.getActordisplayname()}" ("${
        chat.getActorid
      }") has requested a video call in room "${chat.getToken()}" with ID "${chat.getId()}"; creating video call.`
    );

    await bot.writeChat(
      token,
      `@${actorID} started a video call. Tap on https://${domain}/${token} and enter ${password} to join; if no one joins within ${sleepTime} seconds or if the last user leaves, the password will be removed.`
    );

    await jitsi.createRoom(domain, token, botName, password, sleepTime);

    return log.info(
      `WebRTC subsystem exiting room ${chat.getToken()} after ${sleepTime} seconds`
    );
  });
};

const jitsi = new Jitsi();

process.on("SIGINT", async () => await jitsi.close());
process.on("uncaughtException", async (e) => {
  const timeout = 0.125;

  log.info(`bot crashed, restarting in ${timeout} seconds:`, e.stack);

  await new Promise((resolve) => setTimeout(resolve), timeout * 1000);

  main();
});

main();
