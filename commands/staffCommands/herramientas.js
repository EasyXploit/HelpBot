exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-herramientas
    
    try {
        message.delete();
        
        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription(resources.GreenTick + ' ¡Te he enviado los detalles por Mensaje Directo!');

        let helpEmbed = new discord.RichEmbed()
            .setColor(0xFEF65B)
            .setThumbnail('https://i.imgur.com/LkFUg91.png')
            .setAuthor('MODERACIÓN', 'https://i.imgur.com/LkFUg91.png')
            .setTitle('Comandos de moderación del servidor')
            .addField('🛡 ~~!ban <@usuario> [motivo]~~', '~~Banea a un usuario :key:~~')
            .addField('🕑 !tempban <@usuario> [motivo]', 'Banea a un usuario temporalmente :key:')
            .addField('🔄 ~~!kick <@usuario> [motivo]~~', '~~Expulsa a un usuario :key:~~')
            .addField('⏱ !tempkick <@usuario> [motivo]', 'Expulsa a un usuario temporalmente :key:')
            .addField('🔇 ~~!mute <@usuario> [motivo]~~', '~~Silencia a un usuario~~ :key:')
            .addField('🔈 !tempmute <@usuario> [motivo]', 'Silencia a un usuario temporalmente')
            .addField('🔊 !unmute <@usuario>', 'Des-silencia a un usuario :key:')
            .addField('🔔 !warn <@usuario> [advertencia]', 'Advierte a un usuario')
            .addField('⚖ !infractions <@usuario>', 'Comprueba el historial de infracciones de un usuario')
            .addField('🔄 !clear <@canal>', 'Borra los mensajes de un canal :key:')
            .addField('🚥 !slowmode <@canal>', 'Habilita el cooldown de mensajería de un canal :key:')
            .addField('🙍 ~~!user-info <@usuario>~~', '~~Muestra información acerca de un usuario~~')
            .addField('📃 ~~!server-info~~', '~~Muestra información acerca de este servidor~~ :key:')
            .addField('🔖 ~~!role-info <@rol>~~', '~~Muestra información acerca de un rol~~ :key:');
        
        message.channel.send(successEmbed).then(msg => {msg.delete(1000)});
        message.author.send(helpEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
