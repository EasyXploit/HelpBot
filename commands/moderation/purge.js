exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!purge (límite) <#canal | id>
    
    try {
        
        let noQuantityEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar la cantidad de mensajes a eliminar`);
        
        let incorrectQuantityEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad numérica superior a 2 e inferior a 100`);

        if(!args[0]) return message.channel.send(noQuantityEmbed);
        if (isNaN(args[0])) return message.channel.send(NaNEmbed);
        
        let tooMuchOldMessagesEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} Solo puedes borrar mensajes con un máximo de 14 días de antiguedad`);

        let noPrivilegesEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} No tienes permiso para administrar mensajes`);
        
        if (isNaN(args[0]) || args[0] < 2 || args[0] > 100) return message.channel.send(incorrectQuantityEmbed);
        let count = 0;
        let channel;

        if (args[1]) {
            let noChannelEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.error2)
                .setDescription(`${client.customEmojis.redTick} El canal de texto proporcionado no es válido`);
            
            channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!channel) return message.channel.send(noChannelEmbed);


            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & 0x2000) !== 0x2000) return message.channel.send(noPrivilegesEmbed);
            
            const messages = await channel.messages.fetch({limit: args[0]});
            count = messages.size;
            
            let successEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.correct2)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`Mensajes eliminados: ${count}`);

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                
                await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
                await client.functions.loggingManager(loggingEmbed);
            } catch (error) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        } else {
            channel = message.channel;

            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & 0x2000) !== 0x2000) return message.channel.send(noPrivilegesEmbed);
            
            const messages = await message.channel.messages.fetch({limit: args[0]});
            count = messages.size;

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                await client.functions.loggingManager(loggingEmbed);
            } catch (error) {
                message.channel.send(tooMuchOldMessagesEmbed);
            }
        }
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'purge',
    aliases: ['clean']
};
