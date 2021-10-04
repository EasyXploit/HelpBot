exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!join

    try {
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`);
        
        let alreadyInChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot ya está en otra sala.`);
        
        let alreadyInYourChannelEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot ya está en la sala.`);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send({ embeds: {noChannelEmbed} });

        //Comprueba si el bot ya tiene una conexión a un canal de voz en el servidor
        if (message.guild.voice && message.guild.voice.channel) {
            
            //Si está en otra sala diferente
            if (message.member.voice.channelId !== message.guild.member(client.user).voice.channelId) return message.channel.send({ embeds: [alreadyInChannelEmbed] });
            
            //Si está en la sala del miembro
            if (message.member.voice.channelId === message.guild.member(client.user).voice.channelId) return message.channel.send({ embeds: [alreadyInYourChannelEmbed] });
        };

        let noConnectPermissionEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para conectarme a esta sala.`);
        
        let noAfkRoomEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedo unirme al canal de AFK.`);
        
        let fullRoomEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sala está llena.`);

        //Comprueba si el bot tiene permiso para conectarse
        if (!voiceChannel.joinable || client.config.music.forbiddenChannels.includes(voiceChannel.id)) return message.channel.send({ embeds: [noConnectPermissionEmbed] })
        
        //Comprueba si la sala es de AFK
        if (message.member.voice.channelId === message.guild.afkChannelId) return message.channel.send({ embeds: [noAfkRoomEmbed] })
        
        //Comprueba la sala está llena
        if (voiceChannel.full) return message.channel.send({ embeds: [fullRoomEmbed] });

        //Comprueba si la guild tiene una cola de reproducción
        if (!client.queues[message.guild.id]) {
            client.queues[message.guild.id] = {
                queue: [],
                votes: {},
                nowplaying: {},
                mode: false
            };
        };

        //Se une a la sala
        voiceChannel.join().then(connection => {
            
            //Almacena la conexión en una variable global
            client.voiceConnection = connection;
                    
            //Cambia el estatus a "NO DISPONIBLE"
            client.voiceStatus = false;
            
            //Manda un mensaje de confirmación
            message.channel.send({ content: `⏺ | Me he unido al canal` });

            //Crea un contador que para demorar un minuto la salida del canal y la destrucción del dispatcher
            client.voiceTimeout = setTimeout(() => {

                //Manda un mensaje de confirmación
                message.channel.send({ content: `📥 | Unido a \`${voiceChannel.name}\` y vinculado a ${message.channel}.` });
                
                //Aborta la conexión
                connection.disconnect();

                //Confirma la acción
                message.channel.send({ content: `⏏ | He abandonado el canal` });

                //Bora la información de reproducción del server
                delete client.queues[message.guild.id];

                //Vacía la variable del timeout
                client.voiceTimeout = null;
            }, 60000);

        }).catch(err => console.log(`${new Date().toLocaleString()} 》${err.stack}`));
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'join',
    aliases: ['j']
};
