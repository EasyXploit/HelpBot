<div align="center">
  <br />
  <p>
    <a href="https://github.com/EasyXploit/HelpBot"><img src="https://github.com/EasyXploit/HelpBot/blob/master/resources/branding/banner.png?raw=true" width="546" alt="banner" /></a>
  </p>
  <br />
  <p>
    <a href="https://discord.gg/BHkVhjJaCr"><img src="https://img.shields.io/discord/374945492133740544?color=FFC857&label=My%20Discord%20server" alt="Discord server" /></a>
    <a href="https://github.com/EasyXploit/HelpBot/releases"><img src="https://img.shields.io/github/downloads/EasyXploit/HelpBot/total?color=%23FFC857&label=Downloads" alt="Downloads" /></a>
    <a href="https://github.com/EasyXploit/HelpBot/#license"><img src="https://img.shields.io/badge/License-MIT-FFC857" alt="License" /></a>
    <a href="https://github.com/EasyXploit/HelpBot/blob/master/package.json"><img src="https://img.shields.io/github/package-json/v/EasyXploit/HelpBot?color=FFC857&label=Version" alt="Version" /></a>
</a>
  </p>
</div>

## About
[**HelpBot**](https://github.com/EasyXploit/HelpBot) is a [Discord](https://discord.com/) bot designed to run on a [Node.js](https://nodejs.org) server, whose main functions are automated community moderation, music reproduction, leveling, and much more!<br /><br />
This project was born out of curiosity, as a way to give form to the knowledge about [JavaScipt](https://developer.mozilla.org/en-US/docs/Web/JavaScript) that I acquired during a Professional Formation course that I was doing, but that over time has made me discover that I am passionate about programming.<br /><br />
Given that initially it was a project with quite unstable knowledge bases, the code has undergone several refactorings until reaching this point, from which I have decided that I'm going to stop supporting this repository, make it [open source](https://opensource.com/) under an [MIT license](https://en.wikipedia.org/wiki/MIT_License), and continue with other related projects.<br /><br />
Due to this, the bot has **NOT** been designed from the beginning to work in more than one Discord community ([guild](https://discord.com/developers/docs/resources/guild)) at the same time, so the bot does not have a database system, and instead works with [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) files.<br /><br />
Likewise, although the [wrapper](https://developer.mozilla.org/en-US/docs/Glossary/Wrapper) used in this repository to interact with the Discord API, [Discord.js](https://discord.js.org/#/), is the latest version available at the time of writing this article (and therefore compatible with the [API at version 9](https://discord.com/developers/docs/reference#api-versioning-api-versions)), the bot is not able to use the new [interactions](https://discord.com/developers/docs/interactions/receiving-and-responding) system.<br /><br />


> **NOTICE:**<br />
The bot code is <ins>excessively full of comments</ins> (in Spanish), because it is a learning project and my goal in doing this was to understand at all times what I was programming, and to easily recover the thread.
<br />

### Features
|                              |                             |                                              |                               |
|:---:|:---:|:---:|:---:|
| Swear words filtering        | Excesive mentions filtering | XP & role rewards by activity (text & voice) | Preprogrammed scripts support |
| Server inviets filtering     | Excesive spoilers filtering | Embed formatting tools                       | Message purging tool          |
| Excesive uppercase filtering | Repetitive text filtering   | Infractions history                          | YouTube music player          |
| Links filtering              | Automatic penalty dispenser | Invite generation tool                       | Local .mp3 tracks player      |
| Excesive emojis filtering    | Manual moderation commands  | Role, user and server info. showing          | Polls maker                   |
<br />

## Usage
In the [wiki](https://github.com/EasyXploit/HelpBot/wiki) of this repository, you have a guide available where everything about this bot is explained, as well as an initial guide that gives instructions on how to prepare the prerequisites for running the bot, how to download the source code, how to create an account for the bot, how to do the basic configuration and how to run it.<br /><br />
[GO TO THE START GUIDE](https://github.com/EasyXploit/HelpBot/wiki/Starting)<br />
<br />

## Acknowledgments
* Thanks to my programming teacher María José Lozano, for teaching me the basics of JavaScript and how to think like a programmer. Without her lessons, I probably would not have started this project.
* Thanks to the community of [Discord.js](https://github.com/discordjs/discord.js), who have always been there to answer all my questions about the library, and that they constantly work to cover the 100% of the API.<br />
* Thanks to [Flaticon](https://www.flaticon.com) for providing the images contained in the [resources/images/](https://github.com/EasyXploit/HelpBot/tree/master/resources/images) directory.<br />
<br />

## License
MIT License

Copyright (c) 2022 Daniel Perales Mauriz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
