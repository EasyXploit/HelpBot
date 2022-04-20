exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {
        
        //Comprueba si la sintaxis introducida es correcta
        if (args.length < 4 || (args[1] !== 'author' && args[1] !== 'anonymous') || (args[2] !== 'embed' && args[2] !== 'normal')) return await client.functions.syntaxHandler(message.channel, commandConfig);
        
        //Busca y almacena el miembro
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se encontró al miembro
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ]});
        
        //Devuelve un error si el miembro es un bot
        if (member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ]});

        //Almacena el cuerpo del mensaje
        const body = args.slice(3).join(' ');

        //Almacena un string de autoría (por si fuese necesario)
        const authoryString = `**${client.functions.localeParser(locale.normalFrom, { messageAuthorTag: message.author.tag })}:**\n`;

        //Comprueba si se excedió la longitud máxima del cuerpo (si es un embed)
        if (args[2] === 'embed' && body.length > 4096) return await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.maxEmbedLength}.`)
        ]});

        //Comprueba si se excedió la longitud máxima del cuerpo (si es texto plano, dependiendo del modo)
        if (args[2] === 'normal' && ((args[1] === 'author' && (body.length + authoryString.length) > 2000) || (args[1] === 'anonymous' && body.length > 2000 ))) return await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.maxNormalLength, { length: args[1] === 'author' ? 2000 - authoryString.length : '2000' })}.`)
        ]});
        
        //En función del modo seleccionado
        switch (args[1]) {

            //Si se desea enviar en modo "autor"
            case 'author':

                //Si se desea enviar un mensaje de tipo "embed"
                if (args[2] === 'embed') {

                    //Envía el mensaje al miembro
                    await member.user.send({ embeds: [ new client.MessageEmbed()
                        .setAuthor({ name: `${locale.embedFrom}: ${message.author.tag}`, iconURL: message.author.avatarURL() })
                        .setColor(client.config.colors.primary)
                        .setDescription(body)
                    ]});

                } else if (args[2] === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                    //Envía el mensaje al miembro
                    await member.user.send({ content: authoryString + body });
                };

                //Aborta el switch
                break;

            //Si se desea enviar en modo "anónimo"
            case 'anonymous':

                //Variable para saber si está autorizado
                let authorized;

                //Para cada ID de rol de la lista blanca
                for (let index = 0; index < commandConfig.anonymousMode.length; index++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || message.member.roles.cache.find(role => role.id === commandConfig.anonymousMode[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no se permitió la ejecución, manda un mensaje de error
                if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.unauthorized, { messageAuthor: message.author })}.`)
                ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

                //Si se desea enviar un mensaje de tipo "embed"
                if (args[2] === 'embed') {

                    //Envía el mensaje al miembro
                    await member.user.send({ embeds: [ new client.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setDescription(body)
                    ]});

                } else if (args[2] === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                    //Envía el mensaje al miembro
                    await member.user.send({ content: body });
                };

                //Aborta el switch
                break;
        };

        //Envía un registro al canal de registro
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.logging)
            .setTitle(`📑 ${locale.loggingEmbed.title}`)
            .setDescription(client.functions.localeParser(locale.loggingEmbed.description, { messageAuthorTag: message.author.tag, memberTag: member.user.tag, botUser: client.user }))
            .addField(locale.loggingEmbed.date, `<t:${Math.round(new Date() / 1000)}>`, true)
            .addField(locale.loggingEmbed.mode, args[1], true)
            .addField(locale.loggingEmbed.type, args[2], true)
            .addField(locale.loggingEmbed.content, `\`\`\`${body.length > 1014 ? `${body.slice(0, 1014)} ...` : body}\`\`\``)
        );

        //Envía un mensaje de confirmación
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setDescription(`${client.customEmojis.greenTick} ${locale.notificationEmbed}`)
        ]});
        
    } catch (error) {

        //Maneja si un miembro no admite mensajes directos del bot (por la razón que sea)
        if (error.toLocaleString().includes('Cannot send messages to this user')) return await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.cantReceiveDms, { botUser: client.user })}.`)
        ]});

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'dm',
    aliases: ['direct']
};
