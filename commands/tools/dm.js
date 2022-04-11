exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        if (args.length < 4 || (args[1] !== 'author' && args[1] !== 'anonymous') || (args[2] !== 'embed' && args[2] !== 'normal')) return await client.functions.syntaxHandler(message.channel, commandConfig);
            
        let noUserEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`);
        
        //Busca y almacena el miembro
        const member = await client.functions.fetchMember(message.guild, args[0]);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes entablar una conversación con un bot`);

        if (!member) return message.channel.send({ embeds: [noUserEmbed] });
        
        //Devuelve un error si el objetivo es un bot
        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        let mode = args[1];
        let type = args[2];
        let body = args.slice(3).join(' ');
        
        switch (mode) {
            case 'author':
                if (type === 'embed') {
                    let resultMessage = new client.MessageEmbed()
                        .setAuthor({ name: `Mensaje de: ${message.author.tag}`, iconURL: message.author.avatarURL() })
                        .setColor(client.config.colors.primary)
                        .setDescription(body);

                    await member.user.send({ embeds: [resultMessage] });

                } else if (type === 'normal') {
                    await member.user.send({ content: `**Mensaje de ${message.author.tag}:**\n${body}` });
                }
                break;
            case 'anonymous':
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let index = 0; index < commandConfig.anonynmousMode.length; index++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(role => role.id === commandConfig.anonynmousMode[index])) {
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
                    return message.channel.send({ embeds: [noPrivilegesEmbed] }).then(msg => { setTimeout(() => msg.delete(), 5000) });
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

        //Envía un registro al canal de registro
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.logging)
            .setTitle('📑 Registro - [MENSAJERÍA]')
            .setDescription(`${message.author.tag} envió un mensaje privado a ${member.user.tag} a través de <@${client.user.id}>:`)
            .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField('Modo:', mode, true)
            .addField('Tipo:', type, true)
            .addField('Contenido:', `\`\`\`${body}\`\`\``)
        );

        //Envía un mensaje de confirmación
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setDescription(`${client.customEmojis.greenTick} ¡Mensaje enviado!`)
        ]});
        
    } catch (error) {

        //Maneja si un miembro no admite mensajes directos del bot (por la razón que sea)
        if (error.toLocaleString().includes('Cannot send messages to this user')) return await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no admite mensajes directos de <@${client.user.id}>.`)
        ]});

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'dm',
    description: 'El bot enviará un mensaje al miembro, de forma anónima o con el autor referenciado, con formato incrustado o no.',
    aliases: ['direct'],
    parameters: '<@miembro | id> <"author" | "anonymous"> <"embed" | "normal"> <mensaje>'
};
