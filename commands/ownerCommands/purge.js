exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //$purge (límite) <#canal | id>
    
    try {
        let noQuantityEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes proporcionar la cantidad de mensajes a eliminar`);
        
        let NaNEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes proporcionar una cantidad numérica`);

        if(!args[0]) return message.channel.send(noQuantityEmbed);
        if (isNaN(args[0])) return message.channel.send(NaNEmbed);
        
        let tooMuchOldMessagesEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Solo puedes borrar mensajes con un máximo de 14 días de antiguedad`);
        
        const limit = Math.floor(args[0]);
        let count = 0;
        let channel;

        if (args[1]) {
            let noChannelEmbed = new discord.MessageEmbed ()
                .setColor(0xF12F49)
                .setDescription(`${resources.RedTick} El canal de texto proporcionado no es válido`);
            
            channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!channel) return message.channel.send(noChannelEmbed);
    
            message.delete()
            
            const messages = await channel.fetchMessages({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.MessageEmbed ()
                .setColor(0xB8E986)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`Mensajes eliminados: ${count}`);

            let loggingEmbed = new discord.MessageEmbed ()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL())
                .setTitle('📑 Auditoría')
                .setDescription(`<@${message.author.id}> eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                
                await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
                await loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        } else {
            channel = message.channel;
            
            message.delete()
            
            const messages = await message.channel.fetchMessages({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.MessageEmbed ()
                .setColor(0xB8E986)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`Mensajes eliminados: ${count}`);

            let loggingEmbed = new discord.MessageEmbed ()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL())
                .setTitle('📑 Auditoría')
                .setDescription(`<@${message.author.id}> eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                
                await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
                await loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        }
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
