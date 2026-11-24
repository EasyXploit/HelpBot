# Translation

HelpBot shows its messages (both in Discord and in its console) in the language you choose. The texts of each language are stored in the [`locales`](../locales/) folder, in a JSON file per language.

## Supported languages
English is the reference language: every text of the bot is written first in English, and the rest of languages are translated from it. If a text is missing in a language, the bot shows it in English.

| Language | Code | Type | Translators |
|---|---|---|---|
| English | `en-US` | Official | [EasyXploit](https://github.com/EasyXploit) |
| Spanish | `es-ES` | Official | [EasyXploit](https://github.com/EasyXploit) |
| Italian | `it` | Community | [GBruteforce](https://github.com/GBruteforce) |
| Romanian | `ro` | Community | [PichilBerpich](https://github.com/PichilBerpich), [6dr16n6](https://github.com/6dr16n6) |
| Chinese | `zh-CN` | Community | [HardXploit](https://github.com/HardXploitDev) |

Every change to the bot includes its texts in all of these languages. Even so, the translations of the community languages may not be perfect, so the volunteers review and improve them.

## Change the bot language
- **From the console:** go to **Configure > General configuration > Language** (see [Console and configuration](console.md)).
- **With the `LOCALE` setting:** set it to the code of the language (see [Getting started](getting-started.md)). While it is set, the language can not be changed from the console.

The names of the commands can be shown in a different language than the rest of the bot, from **Configure > General configuration > Language of the command names**. Their descriptions are always shown in the bot language.

## Help with the translations
The translations are managed in [POEditor](https://poeditor.com/), where you can fix the translations that are wrong and translate the texts that are missing, without having to deal with the files of this repository.

1. [Submit a request to join the translation team](https://poeditor.com/join/project/emirhxA4pG).
2. Once you are accepted, choose your language in the project and edit its translations.
3. Your changes are brought to this repository before the next changes to the bot, and they are published with its next version.

Please make your changes in POEditor rather than in pull requests to the files of the `locales` folder: POEditor is updated from this repository, so both ways end up in the same place, but POEditor shows the English text next to each translation and keeps track of what is pending.

Do you want to translate the bot into a language that is not supported yet? Ask for it when you join the translation team, or in the [official Discord server](https://discord.gg/g2PNKhT8Zr).

Have you found a wrong or offensive translation? [Open an issue](https://github.com/EasyXploit/HelpBot/issues/new/choose) and tell us what you found.

### Rules for the translations
- Translate only the texts, never the keys (the part before the `:`).
- Keep the **wildcards** exactly as they are (see [below](#wildcards)), and place them where they fit in the sentence of your language.
- Keep the Markdown formatting (`**`, `__`, `` ` ``), the line breaks (`\n`), the emojis and the punctuation that are part of the message.
- The names of the commands and of their options must be in lowercase, without spaces and with up to 32 characters (for example, `ban`). The descriptions of the commands and of their options can have up to 100 characters. These are limits of Discord.
- Keep the tone of the rest of the translation of your language (for example, if it addresses the user informally).

### Wildcards
Some parts of the messages change depending on the situation, such as names, dates or mentions. For those parts, the texts use wildcards: words between double braces, such as `{{memberTag}}`, that the bot replaces with the real value when it shows the message.

For example, this English text:
```json
"description": "{{member}}, you have been warned at {{guildName}}"
```

Is translated into Spanish like this:
```json
"description": "{{member}}, has sido advertido en {{guildName}}"
```

> **Important:** if a translation lacks a wildcard of the English text, the bot shows the English text instead.

The default welcome messages use wildcards between single braces, such as `{memberMention}`, because the administrators of the server can also use them in their own messages. Keep them the same way.

## Custom languages
If you want to use the bot in a language that is not supported, you can make your own translation:
1. Make a copy of [`en-US.json`](../locales/en-US.json) and name it with the code of your language, from the [locales supported by Discord](https://discord.com/developers/docs/reference#locales) (for example, `fr.json`).
2. Translate its texts following the [rules for the translations](#rules-for-the-translations).
3. Add the file to the `locales` folder of the bot. If you deploy it with Docker, mount it in the container, adding a line like this to the `volumes` of the `helpbot` service of your `docker-compose.yml`:
   ```yaml
   - ./fr.json:/app/locales/fr.json:ro
   ```
4. Restart the bot and choose your language from the console.

Consider sharing it in POEditor, so it becomes a supported language and the rest of the community can use it too.

## For maintainers
This repository is the reference for all the languages, and POEditor follows it:
- When the files of the `locales` folder change on the `beta` branch, the [Sync translations with POEditor](../.github/workflows/poeditor-sync.yml) workflow updates POEditor: the English terms are synced (adding the new ones and deleting the ones that no longer exist), and the translations of the rest of languages are imported.
- Before starting new changes to the bot, export the translations from POEditor to the repository (**Export to GitHub**), so the changes made by the volunteers are not overwritten by the next sync.
- The workflow calls the POEditor webhooks stored in the `POEDITOR_WEBHOOK_EN`, `POEDITOR_WEBHOOK_ES`, `POEDITOR_WEBHOOK_IT`, `POEDITOR_WEBHOOK_RO` and `POEDITOR_WEBHOOK_ZH` secrets of the repository. If a language is added, add its webhook (with the **Import translations** operation) as a new secret and to the workflow.

💡 If you have any questions, you can ask in the [official Discord server](https://discord.gg/g2PNKhT8Zr).
