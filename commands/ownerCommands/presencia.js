exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    //$presencia (estatus/actividad) (online/offline/idle/dnd - nombreDeLaAtividad)
    
    let fields = message.content.slice(12).split('" "');
    let lastField = fields.slice(-1).join();

    lastField = lastField.substring(0, lastField.length - 1);
    fields.splice(-1);
    fields.push(lastField);

    let toModify = fields[0].toLowerCase();
    let content = fields[1];
    let changed;
    
    let noCorrectSyntaxEmbed = new discord.RichEmbed()
        .setColor(0xF04647)
        .setTitle('❌ Ocurrió un error')
        .setDescription('La sintaxis del comando es `' + config.ownerPrefix + 'presencia ("estatus/actividad") ("online/invisible/idle/dnd" o "nombreDeLaActividad")`');
    
    let actuallyConfiguredEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Esta configuración ya ha sido aplicada');
    
    if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
    if (toModify !== 'estatus' && toModify !== 'actividad') return message.channel.send(noCorrectSyntaxEmbed);

    try {
        if (toModify === 'estatus') {
            if (content !== 'online' && content !== 'invisible' && content !== 'idle' && content !== 'dnd') return message.channel.send(noCorrectSyntaxEmbed);
            if (content === config.status) return message.channel.send(actuallyConfiguredEmbed);
            config.status = content;

            await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
            await bot.user.setStatus(config.status);

            changed = 'el estado';
        } else if (toModify === 'actividad') {
            if (content === config.game) return message.channel.send(actuallyConfiguredEmbed);
            config.game = content;

            await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);
            await bot.user.setPresence({game: {name: config.game, type: config.type}});

            changed = 'la actividad';   
        } else {
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTitle('❌ Ocurrió un error')
                .addField('Se declaró un siguiente durante la ejecución del comando:', true);
            message.channel.send(errorEmbed);
        }
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }

    let resultEmbed = new discord.RichEmbed()
        .setColor(0xB8E986)
        .setTitle('✅ Operación en marcha')
        .setDescription('Cambiaste ' + changed + ' del bot a `' + content + '`.\nEsta operación podría tardar unos minutos en completarse.')

    let loggingEmbed = new discord.RichEmbed()
        .setColor(0x4A90E2)
        .setTimestamp()
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setTitle('📑 Auditoría')
        .setDescription(message.author.username + ' cambió ' + changed + ' del bot a `' + content + '`');

    if (!changed) return;

    await loggingChannel.send(loggingEmbed);
    await message.channel.send(resultEmbed)
}
