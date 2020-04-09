import Jitsi from "@pojntfx/jitsi-meet-node-client/dist";
import { expose } from "threads/worker";

expose({
  async createRoom(domain, roomName, botName, password, sleepTime) {
    const jitsi = new Jitsi();

    await jitsi.open();

    await jitsi.createRoom(domain, roomName, botName, password);

    console.log("Created room", `${domain}/${roomName}`);

    process.on("SIGINT", async () => await jitsi.close());

    await new Promise((resolve) =>
      setInterval(() => resolve(), sleepTime * 1000)
    );

    return await jitsi.close();
  },
});
