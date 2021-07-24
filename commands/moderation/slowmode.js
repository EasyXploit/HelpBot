exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!slowmode (off | segundos [5-30]) (razón)
    
    try {
        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}slowmode (off | segundos [5-30]) (razón)\``);

        if (args[0] === 'off') {
            if (!message.channel.rateLimitPerUser) return message.channel.send(incorrectSyntaxEmbed).then(msg => {msg.delete({timeout: 5000})});

            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`El modo lento ha sido desactivado`);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [MODO LENTO]')
                .setDescription('Se ha des-habilitado el modo lento.')
                .addField('Moderador:', message.author.tag, true)
                .addField('Canal:', `<#${message.channel.id}>`, true);

            await message.channel.setRateLimitPerUser(0);
            await client.functions.loggingManager(loggingEmbed);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
        } else {
            let seconds = args[0];
            if (isNaN(seconds) || seconds < 5) return message.channel.send(incorrectSyntaxEmbed);

            function checkIfCanUseUnlimitedTime() {

                let authorized; 
                
                //Para cada ID de rol de la lista blanca
                for (let i = 0; i < commandConfig.rolesThatCanUseUnlimitedTime.length; i++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerID || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.rolesThatCanUseUnlimitedTime[i])) {
                        authorized = true;
                        break;
                    };
                };

                if (authorized) return true;
            };

            let tooManySeconds = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.customEmojis.redTick} Los moderadores solo pueden activar el modo lento para un máximo de 30 segundos`);

            if (!checkIfCanUseUnlimitedTime() &&  args[0] > 30) return message.channel.send(tooManySeconds).then(msg => {msg.delete({timeout: 5000})});
            if (!checkIfCanUseUnlimitedTime() &&  !args[1]) return message.channel.send(incorrectSyntaxEmbed).then(msg => {msg.delete({timeout: 5000})});

            let reason;
            if (args[1]) {
                args.shift();
                reason = args.join(' ');
            };

            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`El modo lento ha sido activado con un retraso de \`${seconds}s\``);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [MODO LENTO]')
                .setDescription('Se ha habilitado el modo lento.')
                .addField('Moderador:', message.author.tag, true)
                .addField('Duración:', `${seconds}s`, true)
                .addField('Canal:', `<#${message.channel.id}>`, true)
                .addField('Razón:', reason, true);

            await message.channel.setRateLimitPerUser(seconds, reason || 'Sin razón');
            await client.functions.loggingManager(loggingEmbed);
            await message.channel.send(successEmbed).then(msg => {msg.delete({timeout: 5000})});
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'slowmode',
    aliases: ['slow']
};
