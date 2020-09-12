exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-slowmode (off | segundos [5-30]) (razón)
    
    try {

        message.delete();

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.staffPrefix}slowmode (off | segundos [5-30]) (razón)\``);

        if (args[0] === 'off') {
            if (!message.channel.rateLimitPerUser) return message.channel.send(noCorrectSyntaxEmbed).then(msg => {msg.delete({timeout: 5000})});

            let successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`El modo lento ha sido desactivado`);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría')
                .setDescription('Se ha des-habilitado el modo lento.')
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
                .addField('Moderador:', message.author.tag, true)
                .addField('Canal:', `<#${message.channel.id}>`, true);

            await message.channel.setRateLimitPerUser(0);
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
        } else {
            let seconds = args[0];
            if (isNaN(seconds) || seconds < 5) return message.channel.send(noCorrectSyntaxEmbed);

            let tooManySeconds = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} Los moderadores solo pueden activar el modo lento para un máximo de 30 segundos`);

            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id) &&  args[0] > 30) return message.channel.send(tooManySeconds).then(msg => {msg.delete({timeout: 5000})});
            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id) &&  !args[1]) return message.channel.send(noCorrectSyntaxEmbed).then(msg => {msg.delete({timeout: 5000})});

            let reason;
            if (args[1]) {
                args.shift();
                reason = args.join(' ');
            };

            let successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`El modo lento ha sido activado con un retraso de \`${seconds}s\``);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría')
                .setDescription('Se ha habilitado el modo lento.')
                .setTimestamp()
                .setFooter(client.user.username, client.user.avatarURL())
                .addField('Moderador:', message.author.tag, true)
                .addField('Duración:', `${seconds}s`, true)
                .addField('Canal:', `<#${message.channel.id}>`, true)
                .addField('Razón:', reason, true);

            await message.channel.setRateLimitPerUser(seconds, reason || 'Sin razón');
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
        };
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
