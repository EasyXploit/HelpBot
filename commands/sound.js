exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!sound (nada | término | list)

    try {
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no está disponible. Inténtalo más tarde.`);
        
        let fileNames = fs.readdirSync(`./resources/audios/`);
        let newFileNames = [];
        
        for (var file = 0; file < fileNames.length - 1; file++) {
            newFileNames.push(fileNames[file].slice(0, -4));
        };

        if (fileNames.includes('zorra.mp3')) newFileNames.push('zorra'); //PROVISIONAL (no sé por qué no lo coge de normal)
        
        if (args[0] === `list`) {
            let listEmbed = new discord.MessageEmbed()
                .setColor(0xCCCCCC)
                .setTitle(`🎙 Lista de grabaciones`)
                .setDescription(`\`\`\`${newFileNames.join(`    `)}\`\`\``)
                .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
            message.channel.send(listEmbed);
        } else {
            
            let noChannelEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

            let sound;
            if (args[0]) sound = args.join(` `);
            if (!args[0]) sound = newFileNames[Math.floor(Math.random() * newFileNames.length)]

            let soundNotFoundEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} **${sound}** no existe.`);

            if (newFileNames.includes(sound) == false) return message.channel.send(soundNotFoundEmbed);

            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send(noChannelEmbed);
            
            if (client.voiceStatus || (voiceChannel.id === message.guild.member(client.user).voice.channelID && !client.voiceDispatcher)) {
                client.voiceStatus = false;

                //Si hay un timeout, lo quita
                if (client.voiceTimeout) {
                    clearTimeout(client.voiceTimeout);
                    client.voiceTimeout = null;
                };
                
                let playingEmbed = new discord.MessageEmbed()
                    .setColor(resources.green2)
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
                        client.voiceStatus = true;
                    });
                }).catch(err => console.log(`${new Date().toLocaleString()} 》${err}`));
                return;
            } else {
                return message.channel.send(notAvailableEmbed);
            }
        }
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
