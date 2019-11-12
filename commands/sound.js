exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!sound (término | list)

    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'sound (término)`');
        
        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está disponible. Inténtalo más tarde.`);
        
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let fileNames = fs.readdirSync(`./resources/audios/`);
        let newFileNames = [];
        
        for (var f = 0; f < fileNames.length - 1; f++) {
            newFileNames.push(fileNames[f].slice(0, -4));
        }
        
        if (args[0] === `list`) {
            let listEmbed = new discord.RichEmbed()
                .setColor(0xCCCCCC)
                .setTitle(`🎙 Lista de grabaciones`)
                .setDescription('```' + newFileNames.join(`    `) + '```')
                .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL);
            message.channel.send(listEmbed);
        } else {
            
            let noChannelEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

            let sound = args.join(` `);

            let soundNotFoundEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} **${sound}** no existe.`);

            if (newFileNames.includes(sound) == false) return message.channel.send(soundNotFoundEmbed);

            let voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);
            
            if (bot.voiceStatus) {
                bot.voiceStatus = false;
                
                let playingEmbed = new discord.RichEmbed()
                    .setColor(resources.green)
                    .setDescription(`${resources.GreenTick} Reproduciendo **${sound}**.`);
                
                message.channel.send(playingEmbed);

                voiceChannel.join().then(connection => {
                    const dispatcher = connection.playFile(`./resources/audios/${sound}.mp3`);

                    dispatcher.on("error", reason => {
                        console.log(`Error: ${reason}`);
                    });

                    dispatcher.on("debug", debug => {
                        console.log(`Debug: ${debug}`);
                    });
                    
                    dispatcher.on("start", () => {
                        console.log(`Reproduciendo: true`);
                    });

                    dispatcher.on("end", reason => {
                        console.log(`Fin => Razón: ${reason}`);
                        voiceChannel.leave();
                        bot.voiceStatus = true;
                    });
                }).catch(err => console.log(err));
                return;
            } else {
                return message.channel.send(notAvailableEmbed);
                return;
            }
        }
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
