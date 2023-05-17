export async function run(interaction, commandConfig, locale) {

    try {

        //Busca al miembro objetivo
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

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
                const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedFrequency});

                //Si no está autorizado, devuelve un mensaje de error
                if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cooldown, { member: member })}.`)
                ], ephemeral: true});
            };
        };

        //Genera un nuevo modal
        const reasonModal = new client.Modal()
            .setTitle(locale.bodyModal.title)
            .setCustomId('warnReason');

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
        const modalsFilter = (interaction) => interaction.customId === 'warnReason';

        //Espera a que se rellene el modal
        const reason = await interaction.awaitModalSubmit({ filter: modalsFilter, time: 300000 }).then(async modalInteraction => {

            //Almacena el campo del cuerpo
            const obtainedReason = modalInteraction.fields.getField('body').value;

            //Ejecuta el manejador de infracciones
            await client.functions.moderation.manageWarn(member, obtainedReason, 2, interaction.user, null, modalInteraction, interaction.channel);
            
        }).catch(() => { null; });

        //Aborta si no se proporcionó una razón en el tiempo esperado
        if (!reason) return;

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['USE_EXTERNAL_EMOJIS']
    },
    defaultMemberPermissions: new client.Permissions('MODERATE_MEMBERS'),
    dmPermission: false,
    appData: {
        type: 'USER'
    }
};
