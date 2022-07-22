exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Almacena si el miembro puede ganar EXP
        const notAuthorizedToEarnXp = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { bypassIds: client.config.leveling.wontEarnXP });

        //Si no está autorizado para ello, devuelve un mensaje de error
        if (notAuthorizedToEarnXp) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        //Almacena la modalidad seleccionada
        const modality = interaction.options._hoistedOptions[0].value;

        //Almacena el estado seleccionado
        const status = interaction.options._hoistedOptions[1].value;

        //Almacena los ajustes de notificacion del miembro
        const memberSettings = client.db.stats[interaction.member.id].notifications;

        //Si se desea activar una notificación
        if (status === 'enabled') {

            //Si ya estaba activado, notifica el error
            if (memberSettings[modality]) return interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyEnabled}.`)
            ], ephemeral: true});

            //Activa el ajuste
            memberSettings[modality] = true;

        //Si se desea desactivar una notificación
        } else if (status === 'disabled') {

            //Si ya estaba desactivado, notifica el error
            if (!memberSettings[modality]) return interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyDisabled}.`)
            ], ephemeral: true});

            //Desactiva el ajuste
            memberSettings[modality] = false;
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Notifica el resultado de la acción
            interaction.reply({embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setDescription(`${client.customEmojis.greenTick} ${locale[`${modality}${status.charAt(0).toUpperCase()}${status.slice(1)}`]}.`)
            ], ephemeral: true})
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
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
