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

            //Agradecimiento provisional
            let thanksEmbed = new discord.RichEmbed()
                .setColor(resources.gold)
                .setAuthor(`¡Gracias por añadirme!`, bot.user.displayAvatarURL)
                .setDescription('¡Hola **' + event.owner.user.username + '**! Mi nombre es ' + bot.user.username + ', y he venido a ayudar en tu servidor, el que llaman **' + event.name + '**. Espero ser de tu agrado, a pesar de que soy una versión _beta_. Aprende a utilizarme usando el comando `!ayuda`')
                .addField(`⚙ Configuración`, '`!configurar`', true)
                .addField(`📊 Estadísticas`, `${bot.guilds.size} servidores\n${bot.users.size} usuarios`, true)
                .addField(`🔗 Bot`, `[Añádeme](https://discordapp.com/oauth2/authorize?client_id=446041159853408257&scope=bot&permissions=8)`, true)
                .addField(`💬 Servidor`, `[Únete](${config.serverInvite})`, true)
                .addField(`📣 Twitter`, `___Aún no disponible___`, true)
                .setFooter(`© 2018 República Gamer LLC`, bot.user.avatarURL)

            await bot.channels.get(config.debuggingChannel).send(debuggingEmbed);
            await event.owner.send(thanksEmbed)

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
