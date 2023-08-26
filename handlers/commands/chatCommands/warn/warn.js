export async function run(interaction, commandConfig, locale) {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Devuelve un error si se ha proporcionado un bot
        if (member.user.bot) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.MessageEmbed()
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
                if (!authorized) return interaction.reply({ embeds: [ new discord.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cooldown, { member: member })}.`)
                ], ephemeral: true});
            };
        };

        //Comprueba si se ha aportado alguna razón
        const reason = interaction.options._hoistedOptions[1].value;

        //Almacena el canal de texto de la interacción
        const interactionChannel = await client.functions.utils.fetch('channel', interaction.channelId);

        //Llama al manejador de infracciones
        await client.functions.moderation.manageWarn(member, reason, 2, interaction.user, null, interaction, interactionChannel);

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
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
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
                optionName: 'reason',
                type: discord.ApplicationCommandOptionType.String,
                required: true
            }
        ]
    }
};
