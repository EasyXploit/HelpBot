exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //$presence (estatus | actividad) (online | offline | idle | dnd - nombreDeLaAtividad)
    
    try {
        let fields = message.content.slice(11).split('" "');
        let lastField = fields.slice(-1).join();

        lastField = lastField.substring(0, lastField.length - 1);
        fields.splice(-1);
        fields.push(lastField);

        let toModify = fields[0].toLowerCase();
        let content = fields[1];
        let changed;

        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis del comando es `' + config.ownerPrefix + 'presence ("estatus" | "actividad") ("online" | "offline" | "idle" | "dnd" - "nombreDeLaAtividad")`');

        let actuallyConfiguredEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Esta configuración ya ha sido aplicada');

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        if (toModify !== 'estatus' && toModify !== 'actividad') return message.channel.send(noCorrectSyntaxEmbed);

        if (toModify === 'estatus') {
            if (content !== 'online' && content !== 'invisible' && content !== 'idle' && content !== 'dnd') return message.channel.send(noCorrectSyntaxEmbed);
            if (content === config.status) return message.channel.send(actuallyConfiguredEmbed);
            config.status = content;

            //Graba la configuración
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);
            await bot.user.setStatus(config.status);

            changed = 'el estado';
        } else if (toModify === 'actividad') {
            if (content === config.game) return message.channel.send(actuallyConfiguredEmbed);
            config.game = content;

            //Graba la configuración
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);
            await bot.user.setPresence({game: {name: config.game, type: config.type}});

            changed = 'la actividad';   
        }

        let resultEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación en marcha')
            .setDescription('Cambiaste ' + changed + ' del bot a `' + content + '`.\nEsta operación podría tardar unos minutos en completarse.')

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x4A90E2)
            .setTimestamp()
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .setTitle('📑 Auditoría')
            .setDescription(message.author.username + ' cambió ' + changed + ' del bot a `' + content + '`');

        await loggingChannel.send(loggingEmbed);
        await message.channel.send(resultEmbed)
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
