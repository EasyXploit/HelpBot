exports.run = async (interaction, commandConfig, locale) => {

    try {

        //Si el ejecutor no tiene permisos para borrar mensajes, envía un error
        const missingPermissions = await client.functions.utilities.missingPermissions(channel, interaction.member, ['MANAGE_MESSAGES'])
        if (missingPermissions) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantDeleteMessages}.`)
        ], ephemeral: true});

        //Busca al miembro objetivo
        const member = await client.functions.utilities.fetch('member', interaction.options._hoistedOptions[0].message.author.id);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Devuelve un error si se ha proporcionado un bot
        if (member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});
        
        //Almacena el perfil del miembro
        const memberProfile = await client.functions.db.getData('profile', member.id);

        //Almacena las advertencias del miembro
        const memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;

        //Si el miembro tenía advertencias previas y el ejecutor no es el owner de la guild
        if (memberWarns && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena el último warn del miembro
            const latestWarn = memberWarns[memberWarns.length - 1];

            //Si no ha pasado el tiempo mínimo entre advertencias
            if (Date.now() - latestWarn.timestamp < commandConfig.minimumTimeDifference) {

                //Almacena si el miembro puede saltarse el intervalo mínimo
                const authorized = await client.functions.utilities.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedFrequency});

                //Si no está autorizado, devuelve un mensaje de error
                if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale(locale.cooldown, { member: member })}.`)
                ], ephemeral: true});
            };
        };

        //Genera un nuevo modal
        const reasonModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('removeAndWarnReason');

        //Genera la única fila del modal
        const bodyRow = new client.MessageActionRow().addComponents(

            //Añade un campo de texto a la fila
            new client.TextInputComponent()
                .setCustomId('body')
                .setLabel(locale.bodyModal.fieldTitle)
                .setPlaceholder(locale.bodyModal.fieldPlaceholder)
                .setStyle('PARAGRAPH')
                .setRequired(true)
        );

        //Adjunta los componentes al modal
        reasonModal.addComponents([bodyRow]);

        //Muestra el modal al usuario
        await interaction.showModal(reasonModal);

        //Crea un filtro para obtener el modal esperado
        const modalsFilter = (interaction) => interaction.customId === 'removeAndWarnReason';

        //Espera a que se rellene el modal
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Envía un mensaje de confirmación
            await modalInteraction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}`)
            ], ephemeral: true});

            //Devuelve el campo del cuerpo
            return modalInteraction.fields.getField('body').value;
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó una razón en el tiempo esperado
        if (!reason) return;

        //Almacena el mensaje advertido
        const warnedMessage = interaction.options._hoistedOptions[0].message;

        //Ejecuta el manejador de infracciones
        await client.functions.moderation.manageWarn(member, reason, 3, interaction.user, warnedMessage, null, warnedMessage.channel);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultMemberPermissions: new client.Permissions('MODERATE_MEMBERS'),
    dmPermission: false,
    appData: {
        type: 'MESSAGE'
    }
};
