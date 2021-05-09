exports.run = async (discord, fs, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //$purge (límite) <#canal | id>
    
    try {
        if (message.author.id !== client.config.guild.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let noQuantityEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Debes proporcionar la cantidad de mensajes a eliminar`);
        
        let incorrectQuantityEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Debes proporcionar una cantidad numérica superior a 2 e inferior a 100`);

        if(!args[0]) return message.channel.send(noQuantityEmbed);
        if (isNaN(args[0])) return message.channel.send(NaNEmbed);
        
        let tooMuchOldMessagesEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Solo puedes borrar mensajes con un máximo de 14 días de antiguedad`);
        
        if (isNaN(args[0]) || args[0] < 2 || args[0] > 100) return message.channel.send(incorrectQuantityEmbed);
        let count = 0;
        let channel;

        if (args[1]) {
            let noChannelEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.emotes.redTick} El canal de texto proporcionado no es válido`);
            
            channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!channel) return message.channel.send(noChannelEmbed);
    
            message.delete()

            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & 0x2000) !== 0x2000) return message.channel.send(noPrivilegesEmbed);
            
            const messages = await channel.messages.fetch({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setTitle(`${client.emotes.greenTick} Operación completada`)
                .setDescription(`Mensajes eliminados: ${count}`);

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                
                await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
                await client.loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        } else {
            channel = message.channel;
            
            message.delete()

            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & 0x2000) !== 0x2000) return message.channel.send(noPrivilegesEmbed);
            
            const messages = await message.channel.messages.fetch({limit: args[0]});
            count = messages.size;

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                await client.loggingChannel.send(loggingEmbed);
            } catch (e) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        }
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
