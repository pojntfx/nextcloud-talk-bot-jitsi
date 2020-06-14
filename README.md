# Nextcloud Talk Jitsi Bot

A bot for Nextcloud Talk that creates Jitsi meetings.

## Overview

This chatbot integrates with a Jitsi Meet instance to create password
protected meetings in response to a keyword such as `#videochat` from
Nextcloud Talk. It is a client for `nctalkproxyd`, which in turn is a
part of the [Nextcloud Talk Bot Framework](https://github.com/pojntfx/nextcloud-talk-bot-framework).

## Installation

A Docker image is available at [Docker Hub](https://hub.docker.com/r/pojntfx/nctalkbot-jits).

## Usage

As a prerequisite, the bot requires an instance of [`nctalkproxyd`](https://github.com/pojntfx/nextcloud-talk-bot-framework)
to work, which in turn requires a bot account in Nextcloud. Please adjust the
following commands, which will start both `nctalkproxyd` and the
`nctalkbot-jitsi`bot, with the correct information - you can even
use your own custom bot commands by changing `NCTALKBOT_BOT_COMMANDS`.

```bash
% docker volume create nctalkproxyd
% docker network create nctalkbots
% docker run \
	-p 1969:1969 \
	-v nctalkproxyd:/var/lib/nctalkproxyd \
	-v nctalkproxyd:/var/lib/nctalkproxyd \
	-e NCTALKPROXYD_DBPATH=/var/lib/nctalkproxyd \
	-e NCTALKPROXYD_USERNAME=botusername \
	-e NCTALKPROXYD_PASSWORD=botpassword \
	-e NCTALKPROXYD_ADDRREMOTE=https://mynextcloud.com \
	--network nctalkbots \
	--name nctalkproxyd \
	-d pojntfx/nctalkproxyd
% docker run \
	-e NCTALKBOT_BOT_NAME=botusername \
	-e NCTALKBOT_COMMANDS=\#videochat,\#videocall,\#custom \
	-e NCTALKBOT_SLEEP_TIME=20 \
	-e NCTALKBOT_JITSI_ADDR=meet.jit.si \
	-e NCTALKBOT_JITSI_ROOM_PASSWORD_BYTE_LENGTH=1 \
	-e NCTALKBOT_NCTALKPROXYD_ADDR=localhost:1969 \
	--network nctalkbots \
	-d pojntfx/nctalkbot-jitsi
```

## License

Nextcloud Talk Jitsi Bot (c) 2020 Felicitas Pojtinger

SPDX-License-Identifier: AGPL-3.0
