exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

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

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis del comando es \`${config.ownerPrefix}presence ("estatus" | "actividad") ("online" | "offline" | "idle" | "dnd" - "nombreDeLaAtividad")\``);

        let actuallyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Esta configuración ya ha sido aplicada`);

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        if (toModify !== 'estatus' && toModify !== 'actividad') return message.channel.send(noCorrectSyntaxEmbed);

        if (toModify === 'estatus') {
            if (content !== 'online' && content !== 'invisible' && content !== 'idle' && content !== 'dnd') return message.channel.send(noCorrectSyntaxEmbed);
            if (content === config.status) return message.channel.send(actuallyConfiguredEmbed);
            config.status = content;

            //Graba la configuración
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            await client.user.setStatus(config.status);

            changed = 'el estado';
        } else if (toModify === 'actividad') {
            if (content === config.game) return message.channel.send(actuallyConfiguredEmbed);
            config.game = content;

            //Graba la configuración
            await fs.writeFile('./configs/config.json', JSON.stringify(config, null, 4), (err) => console.error);
            await client.user.setPresence({game: {name: config.game, type: config.type}});

            changed = 'la actividad';   
        }

        let resultEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación en marcha`)
            .setDescription(`Cambiaste ${changed} del bot a \`${content}\`.\nEsta operación podría tardar unos minutos en completarse.`)

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTimestamp()
            .setDescription(`${message.author.username} cambió ${changed} del bot a \`${content}\``);
            .setTitle('📑 Auditoría - [PRESENCIA]')

        await loggingChannel.send(loggingEmbed);
        await message.channel.send(resultEmbed)
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
