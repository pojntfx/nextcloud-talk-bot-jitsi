import Jitsi from "@pojntfx/jitsi-meet-node-client/dist";

const main = async () => {
  const roomsToCreate = [
    ["testroom1", "pass1"],
    ["testroom2", "pass2"],
    ["testroom3", "pass3"],
  ];

  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;

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
