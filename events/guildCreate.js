exports.run = async (event, discord, fs, client) => {
    
    try {
        
        //Comprobación de servidor provisional
        if (event.id === client.homeGuild || event.id === `430436498937217036`) {
            let large = `No`;
            let verified = `No`;

            //Comprueba si el servidor supera los 250 miembros
            if (event.large === true) {
                large = `Si`
            };
            
            //Comprueba si el servidor está verificado
            if (event.verified === true) {
                verified = `Si`;
            };

            let debuggingEmbed = new discord.MessageEmbed()
                .setColor(resources.blue2)
                .setThumbnail(event.iconURL())
                .setAuthor(`${client.user.username} ha sido añadido a una nueva guild`, client.user.displayAvatarURL())
                .addField(`🏷 Nombre`, event.name, true)
                .addField(`🆔 ID`, event.id, true)
                .addField(`👑 Propietario`, event.owner + ' (ID: ' + event.ownerID + ')', true)
                .addField(`📝 Fecha de creación`, event.createdAt.toLocaleString(), true)
                .addField(`🌍 Región`, event.region, true)
                .addField(`🆙 Large guild (+250)`, large, true)
                .addField(`👥 Miembros`, event.members.filter(m => !m.user.bot).size, true)
                .addField(`${resources.GreenTick} Verificado`, verified, true);

            await client.channels.cache.get(config.debuggingChannel).send(debuggingEmbed)

        } else {
            const cantJoinEmbed = new discord.MessageEmbed()
                .setColor(client.colors.gray)
                .setDescription(`${client.emotes.grayTick} | ${client.user.username} no está diseñado para funcionar en más de una guild.`);

            event.owner.send(cantJoinEmbed)
            event.leave();
        }
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        const debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildCreate`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};
