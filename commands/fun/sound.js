exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!sound (nada | término | list)

    try {
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está disponible. Inténtalo más tarde.`);
        
        let fileNames = client.fs.readdirSync(`./media/audios/`);
        let newFileNames = [];
        
        for (var file = 0; file < fileNames.length - 1; file++) {
            newFileNames.push(fileNames[file].slice(0, -4));
        };

        if (fileNames.includes('zorra.mp3')) newFileNames.push('zorra'); //PROVISIONAL (no sé por qué no lo coge de normal)
        
        if (args[0] === `list`) {
            let listEmbed = new discord.MessageEmbed()
                .setColor('CCCCCC')
                .setTitle(`🎙 Lista de grabaciones`)
                .setDescription(`\`\`\`${newFileNames.join(`    `)}\`\`\``);
            message.channel.send({embeds : [listEmbed]});
        } else {
            
            let noChannelEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`);

            let sound;
            if (args[0]) sound = args.join(` `);
            if (!args[0]) sound = newFileNames[Math.floor(Math.random() * newFileNames.length)]

            let soundNotFoundEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} **${sound}** no existe.`);

            if (newFileNames.includes(sound) == false) return message.channel.send({ embeds: [soundNotFoundEmbed] });

            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send({ embeds: [noChannelEmbed] });
            
            if (client.voiceStatus || (voiceChannel.id === message.guild.member(client.user).voice.channelID && !client.voiceDispatcher)) {
                client.voiceStatus = false;

                //Si hay un timeout, lo quita
                if (client.voiceTimeout) {
                    clearTimeout(client.voiceTimeout);
                    client.voiceTimeout = null;
                };
                
                let playingEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.correct2)
                    .setDescription(`${client.customEmojis.greenTick} Reproduciendo **${sound}**.`);
                
                message.channel.send({ embeds: [playingEmbed] });

                voiceChannel.join().then(connection => {
                    const dispatcher = connection.play(`./media/audios/${sound}.mp3`);

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
                }).catch(err => console.log(`${new Date().toLocaleString()} 》${err.stack}`));
                return;
            } else {
                return message.channel.send({ embeds: [notAvailableEmbed] });
            }
        }
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'sound',
    aliases: ['snd']
};
