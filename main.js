const NextcloudTalkBot = require("./src/nextcloudTalkBot");
const Jitsi = require("@pojntfx/jitsi-meet-node-client");
const crypto = require("crypto");
const log = require("pino")();
const util = require("util");
const programName = "nctalkbot";

function parse_args() {
  var configData = null;
  const fs = require("fs");
  const path = require("path");
  const yaml = require("js-yaml");

  console.time("Parsing args");

  // parse arguments
  // https://devhints.io/yargs
  const yargs = require("yargs");
  const argv = yargs
    .scriptName(programName)
    .usage("$0 <options>")
    .example(
      "$0 -f nctalkbot-jitsi.yml",
      " -> The file location is searched relative from calling path"
    )
    .alias("h", "help")
    .env("NCTALKBOT_")
    .help("help")
    .epilog("© 2020 Felicitas Pojtinger")
    .option("a", {
      alias: "jitsiAddr",
      description: "Jitsi server address",
      nargs: 1,
      type: "string",
      //demand: true,
      //demand: 'Argument jitsi addr required',
      default: "meet.jit.si",
    })
    .option("c", {
      alias: "commands",
      description: "Bot commands",
      nargs: 1,
      type: "array",
      demand: false,
      default: '[ "#meeting", "#chat", "#meetjitsi" ]',
    })
    .option("f", {
      alias: "configfile",
      description: "Use config options from given yml file",
      nargs: 1,
      type: "string",
      demand: false,
      default: "/etc/nctalkbot-jitsi.yml",
    })
    .option("n", {
      alias: "botName",
      description: "Bots username",
      nargs: 1,
      type: "string",
      demand: true,
      demand: "Argument username required",
      default: "jitsibot",
    })
    .option("p", {
      alias: "jitsiRoomPasswordLength",
      description: "Bot listening port",
      nargs: 1,
      type: "int",
      demand: true,
      demand: "Argument roomPasswordLength is required",
      default: "4",
    })
    .option("r", {
      alias: "nctalkproxydAddr",
      description: "Nctalkproxyd server address",
      nargs: 1,
      type: "string",
      demand: true,
      demand: "Argument jitsi addr required",
      default: "localhost:1969",
    })
    .option("s", {
      alias: "sleepTimer",
      description: "Bots looping sleep timeout value",
      nargs: 1,
      type: "int",
      demand: true,
      demand: "Argument sleepTimer is required",
      default: "5",
    })
    .strict().argv;

  //if (argv._.includes('file')) {
  //	const configFile = argv.configfile
  //}
  if (argv.version) {
    console.debug(scriptName, " : v", version);
  }

  if (argv.configfile) {
    let ext = path.extname(argv.configfile);
    if (ext !== ".yml" && ext !== ".yaml") {
      throw new Error(
        `configfile '${argv.configfile}' has unsupported extension '${ext}'`
      );
    }

    let configFile = path.normalize(argv.configfile);
    if (path.isAbsolute(configFile)) {
      console.log("configfile (absolute):", configFile);
    } else {
      configFile = path.join(__dirname, configFile);
      console.log("configfile (relative):", configFile);
    }

    try {
      // try with normalized path
      configData = yaml.safeLoad(fs.readFileSync(configFile, "utf8"));
    } catch (e) {
      // try default places: ./
      baseName = path.basename(configFile);
      configFile = path.join(__dirname, baseName);
      try {
        console.debug("searching configfile:", configFile);
        configData = yaml.safeLoad(fs.readFileSync(configFile, "utf8"));
      } catch (e) {
        // handle configfile as relative path
        // try default places: ./etc
        configFile = path.join(__dirname, "etc", baseName);
        try {
          console.debug("searching configfile:", configFile);
          configData = yaml.safeLoad(fs.readFileSync(configFile, "utf8"));
        } catch (e) {
          console.warn("No suitable config file found.");
          console.warn(" ... creating default structure");
          // create default object
          configData = {
            nctalkbot: {
              botName: "jitsibot",
              sleepTimer: "20",
              commands: ["#chat", "#meeting", "#meetjitsi"],
              jitsiAddr: "meet.jit.si",
              jitsiRoomPasswordLength: "4",
              nctalkproxydAddr: "localhost:1969",
            },
          };
        }
      }
    }
  }

  // check that given config file actually describes a nctalkbot environment
  let objectName = util.inspect(
    configData,
    (showHidden = false),
    (depth = 0),
    (colorize = true)
  );
  var objectValue = objectName.substring(
    objectName.lastIndexOf("{") + 2,
    objectName.lastIndexOf(":")
  );

  if (objectValue !== programName)
    throw new Error(
      `configfile describes object '${objectValue}'. We do require '${programName}'!`
    );

  // Ugly: can't we just loop over??
  configData.nctalkbot.botName = argv.botName;
  configData.nctalkbot.commands = argv.commands;
  configData.nctalkbot.sleepTimer = argv.sleepTimer;
  configData.nctalkbot.jitsiAddr = argv.jitsiAddr;
  configData.nctalkbot.jitsiRoomPasswordLength = argv.jitsiRoomPasswordLength;
  configData.nctalkbot.nctalkproxydAddr = argv.nctalkproxydAddr;

  if (process.env.NCTALKBOT_BOT_NAME)
    configData.nctalkbot.botName = process.env.NCTALKBOT_BOT_NAME;
  if (process.env.NCTALKBOT_COMMANDS)
    configData.nctalkbot.commands = process.env.NCTALKBOT_COMMANDS.split(",");
  if (process.env.NCTALKBOT_SLEEP_TIME)
    configData.nctalkbot.sleepTimer = process.env.NCTALKBOT_SLEEP_TIME;
  if (process.env.NCTALKBOT_JITSI_ADDR)
    configData.nctalkbot.jitsiAddr = process.env.NCTALKBOT_JITSI_ADDR;
  if (process.env.NCTALKBOT_JITSI_ROOM_PASSWORD_BYTE_LENGTH)
    configData.nctalkbot.jitsiRoomPasswordLength = NCTALKBOT_JITSI_ROOM_PASSWORD_BYTE_LENGTH;
  if (process.env.NCTALKBOT_NCTALKPROXYD_ADDR)
    configData.nctalkbot.nctalkproxydAddr =
      process.env.NCTALKBOT_NCTALKPROXYD_ADDR;

  console.timeEnd("Parsing args");

  return configData;
}

const main = async () => {
  // parse_args returns struct "config" with param values
  try {
    var config = parse_args();
  } catch (e) {
    console.error("error:", e);
    return;
  }

  console.debug(
    "nctalkbot-jitsi: config structure ...\nconfig:",
    util.inspect(config, (showHidden = false), (depth = 2), (colorize = true))
  );

  /*
      console.debug("nctalkbot-jitsi: botName: " + config.nctalkbot.botName);
      console.debug("nctalkbot-jitsi: commands: " + config.nctalkbot.commands);
      console.debug("nctalkbot-jitsi: sleepTimer: " + config.nctalkbot.sleepTimer);
      console.debug("nctalkbot-jitsi: jitsiAddr: " + config.nctalkbot.jitsiAddr);
      console.debug("nctalkbot-jitsi: jitsiRoomPasswordByteLength: " + config.nctalkbot.jitsiRoomPasswordByteLength);
      console.debug("nctalkbot-jitsi: nctalkproxydAddr: " + config.nctalkbot.nctalkproxydAddr);
    */

  log.info(
    `starting WebRTC node subsystem (timeout: ${config.nctalkbot.sleepTime} seconds)`
  );
  await jitsi.open();

  const bot = new NextcloudTalkBot(config.nctalkbot.nctalkproxydAddr);

  log.info(
    `connecting to nctalkproxyd with address ${config.nctalkbot.nctalkproxydAddr}`
  );

  return await bot.readChats(async (chat) => {
    log.info(
      `Received message from "${chat.getActordisplayname()}" ("${chat.getActorid()}") in room "${chat.getToken()}." with ID "${chat.getId()}": "${JSON.stringify(
        chat.getMessage()
      )}`
    );

    const message = chat.getMessage();

    const test = new RegExp(`^(${config.nctalkbot.commands.join("|")})`, "g");

    if (!test.test(message)) {
      return;
    }

    const token = chat.getToken();
    const actorID = chat.getActorid();
    const password = crypto
      .randomBytes(parseInt(config.nctalkbot.nctalkbotRoomPasswordLength))
      .toString("hex");

    log.info(
      `"${chat.getActordisplayname()}" ("${chat.getActorid}")
	    has requested a video call in room "${chat.getToken()}" with ID "${chat.getId()}"; creating video call.`
    );

    await bot.writeChat(
      token,
      `@${actorID} started a video call. Tap on https://${config.nctalkbot.jitsiaddr}/${token} and enter ${password}
	    to join; if no one joins within ${config.nctalkbot.sleepTimer} seconds or the last user leaves the meeting,
	    the password will be removed and the meeting will be closed.`
    );

    await jitsi.createRoom(
      config.nctalkbot.jitsiAddr,
      token,
      config.nctalkbot.botName,
      password,
      config.nctalkbot.sleepTimer
    );

    return log.info(
      `WebRTC subsystem exiting room ${chat.getToken()} after ${sleepTimer} seconds.`
    );
  });
};

const jitsi = new Jitsi();

process.on("SIGINT", async () => await jitsi.close());
process.on("uncaughtException", async (e) => {
  const timeout = 0.125;

  log.info(`bot crashed! Restarting in ${timeout} seconds:`, e.stack);

  await new Promise((resolve) => setTimeout(resolve), timeout * 1000);

  main();
});

main();
