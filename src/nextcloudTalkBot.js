const path = require("path");
const grpcLibrary = require("@grpc/grpc-js");
const { loadProtoFile } = require("./common");

const protoFile = path.join(__dirname, "protos", "nextcloud_talk.proto");
const NextcloudTalkClient = loadProtoFile(protoFile).nextcloudTalk
  .NextcloudTalk;

const clientInsecureCreds = grpcLibrary.credentials.createInsecure();

module.exports = class NextcloudTalkBot {
  constructor(nctalkproxydURL) {
    this.nctalkproxydURL = nctalkproxydURL;
    this.client = new NextcloudTalkClient(
      this.nctalkproxydURL,
      clientInsecureCreds
    );
  }

  async readChats(onReceiveChat) {
    const chats = this.client.readChats({});
    return chats.on("data", async (chat) => onReceiveChat(chat));
  }

  async writeChat(token, message) {
    this.client.writeChat({ token, message }, () => resolve());
  }
};
