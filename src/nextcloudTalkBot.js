const path = require('path');
const grpcLibrary = require('@grpc/grpc-js');
const { loadProtoFile } = require("./common");

const protoFile = path.join(__dirname, 'protos', 'nextcloud_talk.proto');
const { NextcloudTalkClient } = loadProtoFile(protoFile).nextcloudTalk;
const { InChat } = loadProtoFile(protoFile).nextcloudTalk;
const { Empty } = loadProtoFile(protoFile).google.protobuf.Empty;

module.exports = class {
  constructor(nctalkproxydURL) {
    this.nctalkproxydURL = nctalkproxydURL;
    this.client = new NextcloudTalkClient(
      this.nctalkproxydURL,
      grpcLibrary.credentials.createInsecure()
    );
  }

  async readChats(onReceiveChat) {
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
