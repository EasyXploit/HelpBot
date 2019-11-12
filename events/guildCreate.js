exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {
        
        //Comprobación de servidor provisional
        if (event.id === `374945492133740544` || event.id === `430436498937217036`) {
        
            console.log(`${new Date().toUTCString()} 》${bot.user.username} se unió a la guild: ${event.name}`)

            let large = `No`;
            let verified = `No`;

            //Comprueba si el servidor supera los 250 usuarios
            if (event.large === true) {
                large = `Si`
            };
            
            //Comprueba si el servidor está verificado
            if (event.verified === true) {
                verified = `Si`;
            };

            let debuggingEmbed = new discord.RichEmbed()
                .setColor(resources.blue2)
                .setThumbnail(event.iconURL)
                .setAuthor(`${bot.user.username} ha sido añadido a una nueva guild`, bot.user.displayAvatarURL)
                .addField(`🏷 Nombre`, event.name, true)
                .addField(`🆔 ID`, event.id, true)
                .addField(`👑 Propietario`, event.owner + ' (ID: ' + event.ownerID + ')', true)
                .addField(`📝 Fecha de creación`, event.createdAt.toUTCString(), true)
                .addField(`🌍 Región`, event.region, true)
                .addField(`🆙 Large guild (+250)`, large, true)
                .addField(`👥 Miembros`, event.members.filter(m => !m.user.bot).size, true)
                .addField(`${resources.GreenTick} Verificado`, verified, true)
                .setTimestamp()

            await bot.channels.get(config.debuggingChannel).send(debuggingEmbed)

        } else {
            const cantJoinEmbed = new discord.RichEmbed()
                .setColor(resources.gray)
                .setDescription(`${resources.GrayTick} | Por el momento, ${bot.user.username} solo está disponible en la [República Gamer](${config.serverInvite}).`);

            event.owner.send(cantJoinEmbed)
            event.leave();
        }
    } catch (e) {
        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.RichEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildCreate`, true)
            .addField(`Fecha:`, new Date().toUTCString(), true)
            .addField(`Error:`, e.stack, true)
            .setFooter(new Date().toUTCString(), resources.server.iconURL).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.get(config.debuggingChannel).send(debuggEmbed);
    }
}
