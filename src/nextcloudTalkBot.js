const {
  NextcloudTalkClient,
} = require("./protos/generated/nextcloud_talk_grpc_pb");
const { InChat } = require("./protos/generated/nextcloud_talk_pb");
const { Empty } = require("google-protobuf/google/protobuf/empty_pb.js");
const grpc = require("grpc");

module.exports = class {
  constructor(nxtalkproxydURL) {
    this.nxtalkproxydURL = nxtalkproxydURL;
  }

  async readChats(onReceiveChat) {
    this.client = new NextcloudTalkClient(
      this.nxtalkproxydURL,
      grpc.credentials.createInsecure()
    );

    const chats = this.client.readChats(new Empty());
    return chats.on("data", async (chat) => onReceiveChat(chat));
  }

  async writeChat(token, message) {
    const inChat = new InChat();
    inChat.setToken(token);
    inChat.setMessage(message);

    return await new Promise((resolve) =>
      this.client.writeChat(inChat, () => resolve())
    );
  }
};
