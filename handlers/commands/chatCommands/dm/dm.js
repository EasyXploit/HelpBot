export async function run(interaction, commandConfig, locale) {
    
    try {
        
        //Busca y almacena el miembro
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se encontró al miembro
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.unknownMember}.`)
        ], ephemeral: true});
        
        //Devuelve un error si el miembro es un bot
        if (member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        //Almacena el modo y el tipo seleccionados
        const mode = interaction.options._hoistedOptions[1].value;
        const type = interaction.options._hoistedOptions[2].value;

        //Si se ha seleccionado el modo anónimo
        if (mode === 'anonymous') {

            //Variable para saber si está autorizado
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.anonymousMode});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.unauthorized, { interactionAuthor: interaction.user })}.`)
            ], ephemeral: true});
        };

        //Almacena un string de autoría (por si fuese necesario)
        const authoryString = `**${await client.functions.utils.parseLocale(locale.normalFrom, { authorTag: interaction.user.tag })}:**\n`;

        //Almacena la longitud máxima del campo del modal
        const fieldLength = type === 'embed' ? 4000 : type === 'normal' && mode === 'author'? 2000 - authoryString.length : 2000;

        //Genera un nuevo modal
        const messageContentModal = new discord.ModalBuilder()
            .setTitle(locale.bodyModal.title)
            .setCustomId('dm-body');

        //Genera la única fila del modal
        const bodyRow = new discord.ActionRowBuilder().addComponents(

            //Añade un campo de texto a la fila
            new discord.TextInputBuilder()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle(discord.TextInputStyle.Paragraph)
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
        const bodyMessageModalInteraction = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Devuelve la interacción resultante
            return modalInteraction;
            
        }).catch(() => { null; });

        //Obtiene el campo del cuerpo
        const messageBody = bodyMessageModalInteraction.fields.getField('body').value;

        //Aborta si no se proporcionó un cuerpo en el tiempo esperado
        if (!messageBody) return;

        try {

            //En función del modo seleccionado
            switch (mode) {

                //Si se desea enviar en modo "autor"
                case 'author':

                    //Si se desea enviar un mensaje de tipo "embed"
                    if (type === 'embed') {

                        //Envía el mensaje al miembro
                        await member.user.send({ embeds: [ new discord.EmbedBuilder()
                            .setAuthor({ name: `${locale.embedFrom}: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                            .setDescription(messageBody)
                        ]});

                    } else if (type === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                        //Envía el mensaje al miembro
                        await member.user.send({ content: authoryString + messageBody });
                    };

                    //Aborta el switch
                    break;

                //Si se desea enviar en modo "anónimo"
                case 'anonymous':

                    //Si se desea enviar un mensaje de tipo "embed"
                    if (type === 'embed') {

                        //Envía el mensaje al miembro
                        await member.user.send({ embeds: [ new discord.EmbedBuilder()
                            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                            .setDescription(messageBody)
                        ]});

                    } else if (type === 'normal') { //Si se desea enviar un mensaje de tipo "normal"

                        //Envía el mensaje al miembro
                        await member.user.send({ content: messageBody });
                    };

                    //Aborta el switch
                    break;
            };

            //Envía un registro al canal de registro
            await client.functions.managers.sendLog('sentDM', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbed.title}`)
                .setDescription(await client.functions.utils.parseLocale(locale.loggingEmbed.description, { authorTag: interaction.user.tag, memberTag: member.user.tag, botUser: client.user }))
                .addFields(
                    { name: locale.loggingEmbed.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbed.mode, value: mode, inline: true },
                    { name: locale.loggingEmbed.type, value: type, inline: true },
                    { name: locale.loggingEmbed.content, value: `\`\`\`${messageBody.length > 1014 ? `${messageBody.slice(0, 1014)} ...` : messageBody}\`\`\``, inline: false }
                )
            );

            //Envía un mensaje de confirmación
            await bodyMessageModalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.notificationEmbed}`)
            ], ephemeral: true});

        } catch (error) {

            //Maneja los errores ocurridos cuando no se puede entregar un mensaje privado
            if (error.toString().includes('Cannot send messages to this user')) {
    
                //Envía un log a la consola
                logger.warn(`The bot was unable to deliver a custom DM message to @${member.user.username} (${member.id}) due to an API restriction`);
    
                //Muestra un error al usuario que intentó enviar el mensaje
                return await bodyMessageModalInteraction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cantReceiveDms, { botUser: client.user })}.`)
                ], ephemeral: true});
            };
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            },
            {
                optionName: 'mode',
                type: discord.ApplicationCommandOptionType.String,
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
                type: discord.ApplicationCommandOptionType.String,
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
