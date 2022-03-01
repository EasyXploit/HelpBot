exports.run = async (client, message, args, command, commandConfig) => {
    
    //!dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)
    
    try {
        
        let incorrectSyntaxEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)\`.`);
        
        if (args.length < 4 || (args[0] !== 'autor' && args[0] !== 'anonimo') || (args[2] !== 'embed' && args[2] !== 'normal')) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
            
        let noUserEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);
        
        //Busca y almacena el miembro
        const member = await client.functions.fetchMember(message.guild, args[1]);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes entablar una conversación con un bot`);

        if (!member) return message.channel.send({ embeds: [noUserEmbed] });
        
        //Devuelve un error si el objetivo es un bot
        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        let mode = args[0];
        let type = args[2];
        let body = args.slice(3).join(' ');
        
        switch (mode) {
            case 'autor':
                if (type === 'embed') {
                    let resultMessage = new client.MessageEmbed()
                        .setAuthor({ name: `Mensaje de ${message.author.tag}`, iconURL: message.author.avatarURL() })
                        .setColor(client.config.colors.primary)
                        .setDescription(body);

                    await member.user.send({ embeds: [resultMessage] });
                } else if (type === 'normal') {
                    await member.user.send({ content: `**Mensaje de ${message.author.tag}:**\n${body}` });
                }
                break;
            case 'anonimo':
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let i = 0; i < commandConfig.whitelistedRolesForAnonynmousMode.length; i++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerId || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.whitelistedRolesForAnonynmousMode[i])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no se permitió la ejecución, manda un mensaje de error
                if (!authorized) {
                    //Carga el embed de error de privilegios
                    const noPrivilegesEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`);

                    //Envía el mensaje de error
                    return message.channel.send({ embeds: [noPrivilegesEmbed] }).then(msg => {setTimeout(() => msg.delete(), 5000)});
                };

                if (type === 'embed') {
                    let resultMessage = new client.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setDescription(body);

                    await member.user.send({ embeds: [resultMessage] });
                } else if (type === 'normal') {
                    await member.user.send({ content: body });
                };

                break;
        };

        let confirmEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setDescription(`${client.customEmojis.greenTick} ¡Mensaje enviado!`);

        await message.channel.send({ embeds: [confirmEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'dm',
    aliases: ['direct']
};
