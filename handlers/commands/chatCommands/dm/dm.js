exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {
        
        //Busca y almacena el miembro
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se encontró al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});
        
        //Devuelve un error si el miembro es un bot
        if (member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        //Almacena el modo y el tipo seleccionados
        const mode = interaction.options._hoistedOptions[1].value;
        const type = interaction.options._hoistedOptions[2].value;

        //Si se ha seleccionado el modo anónimo
        if (mode === 'anonymous') {

            //Variable para saber si está autorizado
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.anonymousMode});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.unauthorized, { interactionAuthor: interaction.user })}.`)
            ], ephemeral: true});
        };

        //Almacena un string de autoría (por si fuese necesario)
        const authoryString = `**${await client.functions.utilities.parseLocale.run(locale.normalFrom, { authorTag: interaction.user.tag })}:**\n`;

        //Almacena la longitud máxima del campo del modal
        const fieldLength = type === 'embed' ? 4000 : type === 'normal' && mode === 'author'? 2000 - authoryString.length : 2000;

        //Genera un nuevo modal
        const messageContentModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('dm-body');

        //Genera la única fila del modal
        const bodyRow = new client.MessageActionRow().addComponents(

            //Añade un campo de texto a la fila
            new client.TextInputComponent()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle('PARAGRAPH')
                .setMaxLength(fieldLength)
                .setRequired(true)
        );

        //Adjunta los componentes al modal
        messageContentModal.addComponents([bodyRow]);

        //Muestra el modal al usuario
        await interaction.showModal(messageContentModal);

        //Crea un filtro para obtener el modal esperado
        const modalsFilter = (interaction) => interaction.customId === 'dm-body';

        //Espera a que se rellene el modal
        const body = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Envía un mensaje de confirmación
            await modalInteraction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} ${locale.notificationEmbed}`)
            ], ephemeral: true});

            //Devuelve el campo del cuerpo
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó un cuerpo en el tiempo esperado
        if (!body) return;

        //En función del modo seleccionado
        switch (mode) {

            //Si se desea enviar en modo "autor"
            case 'author':

                //Si se desea enviar un mensaje de tipo "embed"
                if (type === 'embed') {

                    //Envía el mensaje al miembro
                    await member.user.send({ embeds: [ new client.MessageEmbed()
                        .setAuthor({ name: `${locale.embedFrom}: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                        .setColor(client.config.colors.primary)
                        .setDescription(body)
                    ]});

                } else if (type === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                    //Envía el mensaje al miembro
                    await member.user.send({ content: authoryString + body });
                };

                //Aborta el switch
                break;

            //Si se desea enviar en modo "anónimo"
            case 'anonymous':

                //Si se desea enviar un mensaje de tipo "embed"
                if (type === 'embed') {

                    //Envía el mensaje al miembro
                    await member.user.send({ embeds: [ new client.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setDescription(body)
                    ]});

                } else if (type === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                    //Envía el mensaje al miembro
                    await member.user.send({ content: body });
                };

                //Aborta el switch
                break;
        };

        //Envía un registro al canal de registro
        if (client.config.logging.sentDM) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
            .setColor(client.config.colors.logging)
            .setTitle(`📑 ${locale.loggingEmbed.title}`)
            .setDescription(await client.functions.utilities.parseLocale.run(locale.loggingEmbed.description, { authorTag: interaction.user.tag, memberTag: member.user.tag, botUser: client.user }))
            .addFields(
                { name: locale.loggingEmbed.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                { name: locale.loggingEmbed.mode, value: mode, inline: true },
                { name: locale.loggingEmbed.type, value: type, inline: true },
                { name: locale.loggingEmbed.content, value: `\`\`\`${body.length > 1014 ? `${body.slice(0, 1014)} ...` : body}\`\`\``, inline: false }
            )
        );
        
    } catch (error) {

        //Maneja si un miembro no admite mensajes directos del bot (por la razón que sea)
        if (error.toString().includes('Cannot send messages to this user')) return await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.cantReceiveDms, { botUser: client.user })}.`)
        ], ephemeral: true});

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: false,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'mode',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'author',
                        value: 'author'
                    },
                    {
                        choiceName: 'anonymous',
                        value: 'anonymous'
                    }
                ]
            },
            {
                optionName: 'type',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'embed',
                        value: 'embed'
                    },
                    {
                        choiceName: 'normal',
                        value: 'normal'
                    }
                ]
            }
        ]
    }
};
