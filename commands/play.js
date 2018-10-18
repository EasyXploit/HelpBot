exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!play (sonido)

    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'play (sonido)`');

        let noChannelEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} El bot no está disponible. Inténtalo más tarde.`);
        
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let sound = args.join(` `);
        let isReady = true;
        
        let soundNotFoundEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} **${sound}** no existe.`);

        if (isReady) {
            isReady = false;
            let voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);

            voiceChannel.join().then(connection => {
                const dispatcher = connection.playFile(`./resources/audios/${sound}.mp3`);
                if (!dispatcher) return message.channel.send(soundNotFoundEmbed);

                console.log(`Playing ${sound} on ${message.member.voiceChannel.name}`);

                dispatcher.on("end", end => {
                    voiceChannel.leave();
                    console.log(`Finished`);
                });
            }).catch(err => console.log(err));
            isReady = true;
            return;
        } else {
            return message.channel.send(notAvailableEmbed);
            return;
        }
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
