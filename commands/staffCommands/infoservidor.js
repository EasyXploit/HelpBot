exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});
    
    //-infoservidor
    
    try {    
        const guild = message.guild;
        let minutes = (guild.afkTimeout / 60);
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
        
        let categories = new Set();
        
        let categoriesCount = guild.channels.filter(c => {
            if (categories.has(c.parent)) return;
            categories.add(c.parent);
        });
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('Información del servidor', guild.iconURL)
            .setDescription('Mostrando información acerca de la guild ' + guild.name)
            .setThumbnail(guild.iconURL)
            .addField('Nombre', guild.name, true)
            .addField('ID', guild.id, true)
            .addField('Propietario', guild.owner + ' (ID: ' + guild.ownerID + ')', true)
            .addField('Fecha de creación', guild.createdAt.toUTCString(), true)
            .addField('Región', guild.region, true)
            .addField('Canal de AFK', guild.afkChannel.name + '\nTimeout: ' + minutes + ' minutos', true)
            .addField('Large guild (+250)', large, true)
            .addField('Nivel de verificación', guild.verificationLevel, true)
            .addField('Roles', guild.roles.size, true)
            .addField('Miembros', guild.memberCount + ' miembros\n' + guild.members.filter(m => m.user.presence.status == 'online').size + ' online\n' + guild.members.filter(m => m.user.bot).size + ' bots, ' + guild.members.filter(m => !m.user.bot).size + ' humanos', true)
            .addField('Canales', guild.channels.size + ' canales en total:\n' + (categories.size - 1) + ' categorías\n' + guild.channels.filter(c => c.type === 'text').size + ' de texto, ' + guild.channels.filter(c => c.type === 'voice').size + ' de voz', true)
            .addField('Verificado', verified, true)
            
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
