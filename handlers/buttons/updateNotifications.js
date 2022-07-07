exports.run = async (client, interaction) => {
    
    try {

        //Amacena las traducciones del script
        const locale = client.locale.handlers.buttons.updateNotifications;

        //Almacena el miembro de la interacción
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.user.id);

        //Almacena si el miembro puede ganar EXP
        let notAuthorized;

        //Por cada uno de los roles que pueden ganar EXP
        for (let index = 0; index < client.config.leveling.wontEarnXP.length; index++) {

            //Comprueba si el miembro ejecutor lo tiene
            if (member.roles.cache.has(client.config.leveling.wontEarnXP[index])) notAuthorized = true; break;
        };

        //Si no está autorizado para ello, devuelve un mensaje de error
        if (notAuthorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        //Almacena la acción a realizar determinada por el estilo del botón
        const buttonAction = interaction.message.components[0].components[0].style === 'SECONDARY' ? false : true;

        //Almacena los ajustes de notificacion del miembro
        let memberSetting = client.db.stats[interaction.user.id].notifications.private;

        //Si la config. ya estaba aplicada
        if ((!buttonAction && !memberSetting) || (buttonAction && memberSetting)) {

            //Avisa de esta situación al usuario
            interaction.user.send({ content: `${client.customEmojis.orangeTick} | ${locale.alreadyApplied}.` }).then(msg => { setTimeout(() => msg.delete(), 3000) });

        } else {

            //Sino, modifica la base de datos con los cambios
            client.db.stats[interaction.user.id].notifications.private = buttonAction;
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Genera una nueva fila para los botones
            const buttonsRow = new client.MessageActionRow().addComponents(

                //Genera el nuevo botón
                new client.MessageButton()
                    .setLabel(buttonAction ? locale.newButon.disable : locale.newButon.enable)
                    .setStyle(buttonAction ? 'SECONDARY' : 'SUCCESS')
                    .setCustomId('updateNotifications')
            );

            //Edita la interacción con el nuevo botón
            await interaction.update({ components: [buttonsRow] });
        });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};
