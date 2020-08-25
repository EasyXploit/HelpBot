exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!sound (término | list)

    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'sound (término)`');
        
        let notAvailableEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está disponible. Inténtalo más tarde.`);
        
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let fileNames = fs.readdirSync(`./resources/audios/`);
        let newFileNames = [];
        
        for (var f = 0; f < fileNames.length - 1; f++) {
            newFileNames.push(fileNames[f].slice(0, -4));
        }
        
        if (args[0] === `list`) {
            let listEmbed = new discord.MessageEmbed ()
                .setColor(0xCCCCCC)
                .setTitle(`🎙 Lista de grabaciones`)
                .setDescription(`\`\`\`${newFileNames.join(`    `)}\`\`\``)
                .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
            message.channel.send(listEmbed);
        } else {
            
            let noChannelEmbed = new discord.MessageEmbed ()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

            let sound = args.join(` `);

            let soundNotFoundEmbed = new discord.MessageEmbed ()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} **${sound}** no existe.`);

            if (newFileNames.includes(sound) == false) return message.channel.send(soundNotFoundEmbed);

            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);
            
            if (bot.voiceStatus) {
                bot.voiceStatus = false;
                
                let playingEmbed = new discord.MessageEmbed ()
                    .setColor(resources.green)
                    .setDescription(`${resources.GreenTick} Reproduciendo **${sound}**.`);
                
                message.channel.send(playingEmbed);

                voiceChannel.join().then(connection => {
                    const dispatcher = connection.play(`./resources/audios/${sound}.mp3`);

                    dispatcher.on("error", reason => {
                        console.log(`${new Date().toLocaleString()} 》Error: ${reason}`);
                    });

                    dispatcher.on("debug", debug => {
                        console.log(`${new Date().toLocaleString()} 》Debug: ${debug}`);
                    });

                    dispatcher.on("finish", reason => {
                        voiceChannel.leave();
                        bot.voiceStatus = true;
                    });
                }).catch(err => console.log(`${new Date().toLocaleString()} 》${err}`));
                return;
            } else {
                return message.channel.send(notAvailableEmbed);
            }
        }
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
