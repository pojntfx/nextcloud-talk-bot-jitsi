import { spawn, Thread, Worker } from "threads";

const main = async () => {
  const roomsToCreate = [
    ["testroom1", "pass1"],
    ["testroom2", "pass2"],
    ["testroom3", "pass3"],
  ];

  const domain = process.env.JITSI_DOMAIN;
  const botName = process.env.JITSI_BOT_NAME;
  const sleepTime = process.env.JITSI_SLEEP_TIME;

  await Promise.all(
    roomsToCreate.map(async (room) => {
      const worker = await spawn(new Worker("./worker"));
      await worker.createRoom(domain, room[0], botName, room[1], sleepTime);

      await new Promise((resolve) =>
        setInterval(() => resolve(), sleepTime * 1000)
      );

      await Thread.terminate(worker);
    })
  );
};

main();
