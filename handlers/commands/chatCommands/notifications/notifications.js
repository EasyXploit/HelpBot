exports.run = async (interaction, commandConfig, locale) => {
    
    try {

        //Almacena si el miembro puede ganar EXP
        const notAuthorizedToEarnXp = await client.functions.utilities.checkAuthorization(interaction.member, { bypassIds: await client.functions.db.getConfig('leveling.wontEarnXP') });

        //Si no está autorizado para ello, devuelve un mensaje de error
        if (notAuthorizedToEarnXp) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        //Almacena la modalidad seleccionada
        const modality = interaction.options._hoistedOptions[0].value;

        //Almacena el estado seleccionado
        const status = interaction.options._hoistedOptions[1].value;

        //Almacena el perfil del miembro, o lo crea
        let memberProfile = await client.functions.db.getData('profile', interaction.member.id) || await client.functions.db.genData('profile', { userId: interaction.member.id });

        //Almacena los ajustes de notificacion del miembro
        const memberSettings = memberProfile.notifications;

        //Si se desea activar una notificación
        if (status === 'enabled') {

            //Si ya estaba activado, notifica el error
            if (memberSettings[modality]) return interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyEnabled}.`)
            ], ephemeral: true});

            //Activa el ajuste
            memberSettings[modality] = true;

        //Si se desea desactivar una notificación
        } else if (status === 'disabled') {

            //Si ya estaba desactivado, notifica el error
            if (!memberSettings[modality]) return interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyDisabled}.`)
            ], ephemeral: true});

            //Desactiva el ajuste
            memberSettings[modality] = false;
        };

        //Guarda las nuevas estadísticas del miembro en la base de datos
        await client.functions.db.setData('profile', interaction.member.id, memberProfile);

        //Notifica el resultado de la acción
        interaction.reply({embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setDescription(`${client.customEmojis.greenTick} ${locale[`${modality}${status.charAt(0).toUpperCase()}${status.slice(1)}`]}.`)
        ], ephemeral: true})
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'modality',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'public',
                        value: 'public'
                    },
                    {
                        choiceName: 'private',
                        value: 'private'
                    }
                ]
            },
            {
                optionName: 'status',
                type: 'STRING',
                required: true,
                choices: [
                    {
                        choiceName: 'enabled',
                        value: 'enabled'
                    },
                    {
                        choiceName: 'disabled',
                        value: 'disabled'
                    }
                ]
            }
        ]
    }
};
