const Jitsi = require("@pojntfx/jitsi-meet-node-client/dist");
const {
  NextcloudTalkClient,
} = require("./protos/generated/nextcloud_talk_grpc_pb");
const { InChat } = require("./protos/generated/nextcloud_talk_pb");
const { Empty } = require("google-protobuf/google/protobuf/empty_pb.js");
const grpc = require("grpc");

const main = async () => {
  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;
  const nxtalkproxydURL = process.env.NXTALK_PROXYD_URL;

  const client = new NextcloudTalkClient(
    nxtalkproxydURL,
    grpc.credentials.createInsecure()
  );

  const jitsi = new Jitsi();

  process.on("SIGINT", async () => await jitsi.close());
  await jitsi.open();

  const chats = client.readChats(new Empty());
  chats.on("data", async (chat) => {
    const message = chat.getMessage();

    if (!/^#(videochat|videocall)/.test(message)) {
      return;
    }

    const token = chat.getToken();

    const inChat = new InChat();
    inChat.setToken(token);
    inChat.setMessage(`Creating a Jitsi meeting for room ${token}`);

    await new Promise((resolve) => client.writeChat(inChat, () => resolve()));

    await jitsi.createRoom(domain, token, botName, "pass1", sleepTime);

    console.log("Created room", `${domain}/${token}`);

    return await new Promise((resolve) =>
      setInterval(() => resolve(), sleepTime * 1000)
    );
  });
};

main();
