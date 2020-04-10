const NextcloudTalkBot = require("./src/nextcloudTalkBot");
const Jitsi = require("@pojntfx/jitsi-meet-node-client/dist");
const crypto = require("crypto");

(async () => {
  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;
  const nxtalkproxydURL = process.env.NXTALK_PROXYD_URL;
  const passwordLength = process.env.JITSI_PASSWORD_LENGTH;

  const jitsi = new Jitsi();
  process.on("SIGINT", async () => await jitsi.close());
  await jitsi.open();

  const bot = new NextcloudTalkBot(nxtalkproxydURL);

  await bot.readChats(async (chat) => {
    const message = chat.getMessage();

    if (!/^#(videochat|videocall)/.test(message)) {
      return;
    }

    const token = chat.getToken();
    const actorID = chat.getActorid();
    const password = crypto
      .randomBytes(parseInt(passwordLength))
      .toString("hex");

    await bot.writeChat(
      token,
      `@${actorID} started a video call. Tap on https://${domain}/${token} and enter ${password} to join; if no one joins within ${sleepTime} seconds or if the last user leaves, the password will be removed.`
    );

    return await jitsi.createRoom(domain, token, botName, password, sleepTime);
  });
})();
