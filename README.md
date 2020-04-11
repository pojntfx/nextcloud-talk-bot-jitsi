# Nextcloud Talk Jitsi Bot

A bot for Nextcloud Talk that creates Jitsi meetings.

## Overview

This chatbot integrates with a Jitsi Meet instance to create password protected meetings in response to a keyword such as `#videochat` from Nextcloud Talk. It is a client for `nxtalkproxyd`, which in turn is a part of the [Nextcloud Talk Bot Framework](https://github.com/pojntfx/nextcloud-talk-bot-framework).

## Installation

A Docker image is available at [Docker Hub](https://hub.docker.com/r/pojntfx/nextcloud-talk-bot-jitsi).

## Usage

As a prerequisite, the bot requires an instance of [`nxtalkproxyd`](https://github.com/pojntfx/nextcloud-talk-bot-framework) to work, which in turn requires a bot account in Nextcloud. Please adjust the following commands, which will start both `nxtalkproxyd` and the bot, with the correct information - you can even use your own custom bot commands by changing `BOT_COMMANDS`.

```bash
% docker volume create nxtalkproxyd
% docker network create nxtalkchatbots
% docker run \
    -p 1969:1969 \
    -v nxtalkproxyd:/var/lib/nxtalkproxyd \
    -e NXTALKPROXYD_NXTALKPROXYD_DBPATH=/var/lib/nxtalkproxyd \
    -e NXTALKPROXYD_NXTALKPROXYD_USERNAME=botusername \
    -e NXTALKPROXYD_NXTALKPROXYD_PASSWORD=botpassword \
    -e NXTALKPROXYD_NXTALKPROXYD_RADDR=https://examplenextcloud.com \
    --network nxtalkchatbots \
    --name nxtalkproxy \
    -d pojntfx/nxtalkproxy
% docker run \
    -e BOT_JITSI_ADDR=meet.jit.si \
    -e BOT_JITSI_BOT_NAME=botusername \
    -e BOT_JITSI_SLEEP_TIME=20 \
    -e BOT_NXTALKPROXYD_ADDR=nxtalkproxy:1969 \
    -e BOT_JITSI_ROOM_PASSWORD_BYTE_LENGTH=1 \
    -e BOT_COMMANDS=\#videochat,\#videocall,\#custom \
    --network nxtalkchatbots \
    -d pojntfx/nextcloud-talk-bot-jitsi
```

## License

Nextcloud Talk Jitsi Bot (c) 2020 Felicitas Pojtinger

SPDX-License-Identifier: AGPL-3.0
