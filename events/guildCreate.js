exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    if (event.id === '374945492133740544' || event.id === '430436498937217036') {
        
        console.log('\n' + new Date() + ' 》' + bot.user.username + ' se unió a la guild: ' + event.name + '\n')
        
        const debuggingChannel = bot.channels.get(config.debuggingChannel);
        const guild = event;
        
        let large = 'No';
        let verified;
        
        if (guild.large === true) {large = 'Si'};
        if (guild.verified === true) {
            verified = 'Si';
        } else if (guild.verified === false) {
            verified = 'No';
        } else if (guild.verified === undefined) {
            verified = 'No';
        }

        let debuggingEmbed = new discord.RichEmbed()
            .setColor(0x7CD6F9)
            .setThumbnail(guild.iconURL)
            .setTimestamp()
            .setAuthor(bot.user.username + ' ha sido añadido a una nueva guild', bot.user.displayAvatarURL)
            .addField('Nombre', guild.name, true)
            .addField('ID', guild.id, true)
            .addField('Propietario', guild.owner + ' (ID: ' + guild.ownerID + ')', true)
            .addField('Fecha de creación', guild.createdAt.toUTCString(), true)
            .addField('Región', guild.region, true)
            .addField('Large guild (+250)', large, true)
            .addField('Miembros', guild.members.filter(m => !m.user.bot).size, true)
            .addField('Verificado', verified, true)
        
        let thanksEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('¡Gracias por añadirme!', bot.user.displayAvatarURL)
            .setDescription('¡Hola **' + event.owner.user.username + '**! Mi nombre es ' + bot.user.username + ', y he venido a ayudar en tu servidor, el que llaman **' + event.name + '**. Espero ser de tu agrado, a pesar de que soy una versión _beta_. Aprende a utilizarme usando el comando `!ayuda`')
            .addField('⚙ Configuración', '`!configurar`', true)
            .addField('📊 Estadísticas', bot.guilds.size + ' servidores\n' + bot.users.size + ' usuarios', true)
            .addField('🔗 Bot', '[Añádeme](https://discordapp.com/oauth2/authorize?client_id=446041159853408257&scope=bot&permissions=8)', true)
            .addField('💬 Servidor', '[Únete](' + config.serverInvite + ')', true)
            .addField('📣 Twitter', '___Aún no disponible___', true)
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        
        await debuggingChannel.send(debuggingEmbed);
        await event.owner.send(thanksEmbed)
        
    } else {
        const cantJoinEmbed = new discord.RichEmbed()
            .setColor(0xC6C9C6)
            .setDescription(resources.GrayTick + ' | Por el momento, ' + bot.user.username + ' solo está disponible en la República Gamer.');
        
        event.owner.send(cantJoinEmbed)
        event.leave();
    }
}
