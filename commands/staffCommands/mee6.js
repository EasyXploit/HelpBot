exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-mee6
    
    try {
        message.delete();
        
        const mee6Avatar = message.guild.members.cache.get('159985870458322944').user.displayAvatarURL;
        
        let successEmbed = new discord.MessageEmbed ()
            .setColor(0xB8E986)
            .setDescription(resources.GreenTick + ' ¡Te he enviado los detalles por Mensaje Directo!');

        let helpEmbed = new discord.MessageEmbed ()
            .setColor(0x5FD1F6)
            .setThumbnail(mee6Avatar)
            .setAuthor('MODERACIÓN DE MEE6', mee6Avatar)
            .setDescription('Comandos de moderación del bot <@159985870458322944>')
            .addField('🔊 !unmute <@usuario>', `Des-silencia a un usuario silenciado por <@159985870458322944>.${resources.chevron10}`)
            .addField('⚖ !infractions <@usuario>', 'Comprueba el historial de infracciones de <@159985870458322944> de un usuario.')
            .addField('🚥 !slowmode <@canal>', `Habilita el cooldown de mensajería de un canal.${resources.chevron10}`)
            .setFooter('Algunos comandos no se muestran debido a que PilkoBot ahora se encarga de su funcionamiento. Mas detalles con el comando -staff', mee6Avatar);
        
        message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 1000})});
        message.author.send(helpEmbed);
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
