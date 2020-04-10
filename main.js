const Jitsi = require("@pojntfx/jitsi-meet-node-client/dist");
const {
  NextcloudTalkClient,
} = require("./protos/generated/nextcloud_talk_grpc_pb");
const { InChat } = require("./protos/generated/nextcloud_talk_pb");
const grpc = require("grpc");

const main = async () => {
  const roomsToCreate = [
    ["testroom1", "pass1"],
    ["testroom2", "pass2"],
    ["testroom3", "pass3"],
  ];

  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;
  const nxtalkproxydURL = process.env.NXTALK_PROXYD_URL;

  const client = new NextcloudTalkClient(
    nxtalkproxydURL,
    grpc.credentials.createInsecure()
  );

  const inChat = new InChat();
  inChat.setToken("2j9j95et");
  inChat.setMessage("Testing");

  await new Promise((resolve) => client.writeChat(inChat, () => resolve()));

  const jitsi = new Jitsi();

  process.on("SIGINT", async () => await jitsi.close());
  await jitsi.open();

  await Promise.all(
    roomsToCreate.map(async (room) => {
      await jitsi.createRoom(domain, room[0], botName, room[1]);

      console.log("Created room", `${domain}/${room[0]}`);

      return await new Promise((resolve) =>
        setInterval(() => resolve(), sleepTime * 1000)
      );
    })
  );

  await jitsi.close();
};

main();
