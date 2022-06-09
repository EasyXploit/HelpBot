exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Devuelve un error si se ha proporcionado un bot
        if (member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Si el miembro tenía advertencias previas y el ejecutor no es el owner de la guild
        if (client.db.warns[member.id] && interaction.member.id !== interaction.guild.ownerId) {
            
            //Almacena las claves de cada uno de los warns del miembro
            const warnsKeys = Object.keys(client.db.warns[member.id]);

            //Almacena el último warn del miembro
            const latestWarn = client.db.warns[member.id][warnsKeys[warnsKeys.length - 1]];

            //Si no ha pasado el tiempo mínimo entre advertencias
            if (Date.now() - latestWarn.timestamp < commandConfig.minimumTimeDifference) {

                //Almacena si el miembro puede saltarse el intervalo mínimo
                let authorized;

                //Por cada uno de los roles que pueden saltarse el intervalo mínimo
                for (let index = 0; index < commandConfig.unlimitedFrequency; index++) {

                    //Comprueba si el miembro ejecutor lo tiene
                    if (interaction.member.roles.cache.has(commandConfig.unlimitedFrequency[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no está autorizado, devuelve un mensaje de error
                if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.cooldown, { member: member })}.`)
                ], ephemeral: true});
            };
        };

        //Comprueba si se ha aportado alguna razón
        const reason = interaction.options._hoistedOptions[1].value;

        //Almacena el canal de texto de la interacción
        const interactionChannel = await client.functions.fetchChannel(interaction.channelId);

        //Llama al manejador de infracciones
        await require('../../../utils/moderation/infractionsHandler.js').run(client, member, reason, 2, interaction.user, null, interaction, interactionChannel);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: true
            }
        ]
    }
};
