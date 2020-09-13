exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //$purge (límite)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let noQuantityEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar la cantidad de mensajes a eliminar`);
        
        let incorrectQuantityEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar una cantidad numérica superior a 2 e inferior a 100`);

        if(!args[0]) return message.channel.send(noQuantityEmbed);
        if (isNaN(args[0])) return message.channel.send(NaNEmbed);
        
        let tooMuchOldMessagesEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Solo puedes borrar mensajes con un máximo de 14 días de antiguedad`);
        
        if (isNaN(args[0]) || args[0] < 2 || args[0] > 100) return message.channel.send(incorrectQuantityEmbed);
        let count = 0;

        message.delete()
        
        const messages = await message.channel.messages.fetch({limit: args[0]});
        count = messages.size;

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.blue)
            .setTimestamp()
            .setFooter(client.user.username, client.user.avatarURL())
            .setTitle('📑 Auditoría')
            .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${message.channel.id}>`);
        
        try {
            await message.channel.bulkDelete(messages);
            await loggingChannel.send(loggingEmbed);
        } catch (e) {
            message.channel.send(tooMuchOldMessagesEmbed);
        }
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
