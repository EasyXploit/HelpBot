exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //$purge (límite) <#canal | id>
    
    try {
        let noQuantityEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar la cantidad de mensajes a eliminar');
        
        let NaNEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar una cantidad numérica');

        if(!args[0]) return message.channel.send(noQuantityEmbed);
        if (isNaN(args[0])) return message.channel.send(NaNEmbed);
        
        let tooMuchOldMessagesEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Solo puedes borrar mensajes con un máximo de 14 días de antiguedad');
        
        const limit = Math.floor(args[0]);
        let count = 0;
        let channel;

        if (args[1]) {
            let noChannelEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' El canal de texto proporcionado no es válido');
            
            channel = message.mentions.channels.first() || message.guild.channels.get(args[0]);
            if (!channel) return message.channel.send(noChannelEmbed);
    
            message.delete()
            
            const messages = await channel.fetchMessages({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setTitle(resources.GreenTick + ' Operación completada')
                .setDescription('Mensajes eliminados: ' + count);

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL)
                .setTitle('📑 Auditoría')
                .setDescription('<@' + message.author.id + '> eliminó ' + count + ' mensajes del canal <#' + channel.id + '>');
            
            let runningEmbed = new discord.RichEmbed()
                .setColor(0xC6C9C6)
                .setTitle(resources.GrayTick + ' Operación en marcha')
                .setDescription('Se han encontrado ' + count + ' mensajes. Eliminando ...');
            
            try {
                await message.channel.send(runningEmbed).then(msg => {msg.delete(2000)}).then(await channel.bulkDelete(messages));
                
                await message.channel.send(successEmbed).then(msg => {msg.delete(5000)});
                await loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        } else {
            channel = message.channel;
            
            message.delete()
            
            const messages = await message.channel.fetchMessages({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setTitle(resources.GreenTick + ' Operación completada')
                .setDescription('Mensajes eliminados: ' + count);

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL)
                .setTitle('📑 Auditoría')
                .setDescription('<@' + message.author.id + '> eliminó ' + count + ' mensajes del canal <#' + channel.id + '>');
            
            let runningEmbed = new discord.RichEmbed()
                .setColor(0xC6C9C6)
                .setTitle(resources.GrayTick + ' Operación en marcha')
                .setDescription('Se han encontrado ' + count + ' mensajes. Eliminando ...');
            
            try {
                await message.channel.send(runningEmbed).then(msg => {msg.delete(2000)}).then(await channel.bulkDelete(messages));
                
                await message.channel.send(successEmbed).then(msg => {msg.delete(5000)});
                await loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}