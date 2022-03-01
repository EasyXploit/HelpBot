exports.run = async (client, message, args, command, commandConfig) => {
    
    //!purge (límite) <#canal | id>
    
    try {
        
        let noQuantityEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar la cantidad de mensajes a eliminar`);
        
        let incorrectQuantityEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad numérica  igual o superior a 1, e inferior a 100`);

        if(!args[0]) return message.channel.send({ embeds: [noQuantityEmbed] });
        if (isNaN(args[0])) return message.channel.send({ embeds: [NaNEmbed] });
        
        let tooMuchOldMessagesEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Solo puedes borrar mensajes con un máximo de 14 días de antiguedad`);

        let noPrivilegesEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No tienes permiso para administrar mensajes`);
        
        if (isNaN(args[0]) || args[0] < 1 || args[0] >= 100) return message.channel.send({ embeds: [incorrectQuantityEmbed] });
        let count = 0;
        let channel;

        if (args[1]) {
            let noChannelEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} El canal de texto proporcionado no es válido`);
            
            channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!channel) return message.channel.send({ embeds: [noChannelEmbed] });


            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & BigInt(0x2000)) !== BigInt(0x2000)) return message.channel.send({ embeds: [noPrivilegesEmbed] });
            
            const messages = await channel.messages.fetch({limit: parseInt(args[0]) + 1});
            count = messages.size;
            
            let successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`Mensajes eliminados: ${count}`);

            let loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                
                await message.channel.send({ embeds: [successEmbed] }).then(msg => {setTimeout(() => msg.delete(), 5000)});
                await client.functions.loggingManager(loggingEmbed);
            } catch (error) {
                message.channel.send({ embeds: [tooMuchOldMessagesEmbed] });
            }
        } else {
            channel = message.channel;

            const memberPermissions = channel.permissionsFor(message.author).bitfield;
            if ((memberPermissions & BigInt(0x2000)) !== BigInt(0x2000)) return message.channel.send({ embeds: [noPrivilegesEmbed] });
            
            const messages = await message.channel.messages.fetch({limit: parseInt(args[0]) + 1});
            count = messages.size;

            let loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Auditoría - [PURGA DE MENSAJES]')
                .setDescription(`${message.author.tag} eliminó ${count} mensajes del canal <#${channel.id}>`);
            
            try {
                await channel.bulkDelete(messages);
                await client.functions.loggingManager(loggingEmbed);
            } catch (error) {
                message.channel.send({ embeds: [tooMuchOldMessagesEmbed] });
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