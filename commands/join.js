exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!join

    try {
        let noChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);
        
        let alreadyInChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot ya está en otra sala.`);
        
        let alreadyInYourChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot ya está en la sala.`);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);

        //Comprueba si el bot ya tiene una conexión a un canal de voz en el servidor
        if (message.guild.voiceConnection) {
            
            //Si está en otra sala diferente
            if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(alreadyInChannelEmbed);
            
            //Si está en la sala del miembro
            if (message.member.voiceChannelID === message.guild.member(bot.user).voiceChannelID) return message.channel.send(alreadyInYourChannelEmbed);
        }

        let noConnectPermissionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para conectarme a esta sala.`);
        
        let noAfkRoomEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No puedo unirme al canal de AFK.`);
        
        let fullRoomEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sala está llena.`);

        //Comprueba si el bot tiene permiso para conectarse
        if (!voiceChannel.joinable) return message.channel.send(noConnectPermissionEmbed)
        
        //Comprueba si la sala es de AFK
        if (message.member.voiceChannelID === message.guild.afkChannelID) return message.channel.send(noAfkRoomEmbed)
        
        //Comprueba la sala está llena
        if (voiceChannel.full) return message.channel.send(fullRoomEmbed)

        //Se une a la sala
        voiceChannel.join().then(connection => {
            
            //Almacena la conexión en una variable global
            bot.voiceConnection = connection;
                    
            //Cambia el estatus a "NO DISPONIBLE"
            bot.voiceStatus = false;
            
            //Manda un mensaje de confirmación
            message.channel.send(`⏺ | Me he unido al canal`);

        }).catch(err => console.log(err));
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}