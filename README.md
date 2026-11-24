<div align="center">
  <br />
  <p>
    <a href="https://github.com/EasyXploit/HelpBot"><img src="assets/branding/banner.png" width="640" alt="HelpBot banner" /></a>
  </p>
  <br />
  <p>
    <a href="https://github.com/EasyXploit/HelpBot/blob/master/package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FEasyXploit%2FHelpBot%2Fmaster%2Fpackage.json&query=%24.version&prefix=v&color=FFC857&label=Stable" alt="Stable version" /></a>
    <a href="https://github.com/EasyXploit/HelpBot/blob/beta/package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FEasyXploit%2FHelpBot%2Fbeta%2Fpackage.json&query=%24.version&prefix=v&color=FFC857&label=Beta" alt="Beta version" /></a>
    <a href="https://github.com/EasyXploit/HelpBot/pkgs/container/helpbot"><img src="https://img.shields.io/badge/Docker-ghcr.io-FFC857" alt="Docker image" /></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-FFC857" alt="License" /></a>
    <img src="https://img.shields.io/github/repo-size/EasyXploit/HelpBot?color=FFC857&label=Repo%20size" alt="Repo size" />
    <a href="https://discord.gg/g2PNKhT8Zr"><img src="https://img.shields.io/badge/Discord-Join%20the%20server-FFC857?logo=discord&logoColor=white" alt="Discord server" /></a>
  </p>
</div>

## About
[**HelpBot**](https://github.com/EasyXploit/HelpBot) is a [Discord](https://discord.com/) self-hosted bot built with [Node.js](https://nodejs.org) and distributed as a [Docker](https://www.docker.com/) image, whose main functions are automated community moderation, leveling, chat utilities and much more!<br /><br />
This project was born out of curiosity, as a way to give form to the knowledge about [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) that I acquired during a Professional Formation course that I was doing, but that over time has made me discover that I am passionate about programming.<br /><br />
Given that initially it was a project with quite unstable knowledge bases, the code has undergone several refactorings until reaching this point, from which I have decided that I'm going to make it [open source](https://opensource.com/) under an [MIT license](https://en.wikipedia.org/wiki/MIT_License), and continue with its development and work on other related projects.<br /><br />
Due to this, the bot has **NOT** been designed from the beginning to work in more than one Discord community ([guild](https://discord.com/developers/docs/resources/guild)) at the same time, so each instance of the bot serves a single guild, and stores its configuration and data in its own [MongoDB](https://www.mongodb.com/) database.<br /><br />


> **NOTICE:**<br />
The bot code is <ins>excessively full of comments</ins>, because it is a learning project and my goal in doing this was to understand at all times what I was programming, and to easily recover the thread (the old commits, issues and projects were written in Spanish).
<br />

### Features
|                              |                             |                                              |                               |
|:---:|:---:|:---:|:---:|
| Swear words filtering        | Excessive mentions filtering | XP & role rewards by activity (text & voice) | Public & private welcomes     |
| Server invites filtering     | Excessive spoilers filtering | Scheduled messages                               | Message purging tool          |
| Excessive uppercase filtering | Repetitive text filtering   | Infractions history                          | Reports system                |
| Links filtering              | Automatic penalty dispenser | Multiple locales                             | Flood filtering               |
| Excessive emojis filtering   | Manual moderation commands  | Role, user and server info. showing          | Polls maker                   |
| Server events logging        | Configuration from the console | Recovery of the joins while offline       | Docker image with auto-updates |
<br />

## Usage
In the [docs](docs/) folder of this repository, you have the documentation for this version of the bot, with a start guide that explains how to create an account for the bot, how to deploy it with Docker and how to configure it from its console.<br /><br />
You only need a machine with [Docker](https://www.docker.com/), as the bot is published as a ready-to-use image in the GitHub Container Registry.<br /><br />
[GO TO THE START GUIDE](docs/getting-started.md)<br />
<br />

## Support
🛟 Need help? Want to discuss the development? Join the [official Discord server](https://discord.gg/g2PNKhT8Zr)!<br />
<br />

## Acknowledgments
* Thanks to my programming teacher María José Lozano, for teaching me the basics of JavaScript and how to think like a programmer. Without her lessons, I probably would not have started this project.
* Thanks to the [supported languages](https://github.com/EasyXploit/HelpBot/wiki/Translation#supported-languages) translators who make this repository accessible to many more people.
* Thanks to the community of [Discord.js](https://github.com/discordjs/discord.js), who have always been there to answer all my questions about the library, and that they constantly work to cover the 100% of the API.<br />
* Thanks to [Flaticon](https://www.flaticon.com) for providing the images contained in the [assets/images/](assets/images/) directory.
<br />

## License
This project is licensed under the [MIT license](LICENSE.md).
