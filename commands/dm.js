exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)
    
    try {
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)\``);
        
        if (args.length < 4 || (args[0] !== 'autor' && args[0] !== 'anonimo') || (args[2] !== 'embed' && args[2] !== 'normal')) return message.channel.send(noCorrectSyntaxEmbed);
            
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);
        
        //Busca y almacena el miembro
        const member = await client.functions.fetchMember(message.guild, args[1]);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} No puedes entablar una conversación con un bot`);

        if (!member) return message.channel.send(noUserEmbed);
        
        //Devuelve un error si el objetivo es un bot
        if (member.user.bot) return message.channel.send(noBotsEmbed);

        let mode = args[0];
        let type = args[2];
        let body = args.slice(3).join(' ');
        let resultMessage = body;
        
        switch (mode) {
            case 'autor':
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setAuthor(`Mensaje de ${message.author.tag}`, message.author.avatarURL())
                        .setColor(client.colors.primary)
                        .setDescription(body);
                } else if (type === 'normal') {
                    resultMessage = `**Mensaje de ${message.author.tag}:**\n${resultMessage}`
                }
                break;
            case 'anonimo':
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let i = 0; i < commandConfig.whitelistedRolesForAnonynmousMode.length; i++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerID || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.whitelistedRolesForAnonynmousMode[i])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no se permitió la ejecución, manda un mensaje de error
                if (!authorized) {
                    //Carga el embed de error de privilegios
                    const noPrivilegesEmbed = new discord.MessageEmbed()
                        .setColor(client.colors.red)
                        .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`);

                    //Envía el mensaje de error
                    return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});
                };

                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setColor(client.colors.primary)
                        .setDescription(body);
                }
                break;
        };

        await member.user.send(resultMessage);

        let confirmEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setDescription(`${client.customEmojis.greenTick} ¡Mensaje enviado!`);

        await message.channel.send(confirmEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
