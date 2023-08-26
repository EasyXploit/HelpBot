export default async (interaction) => {
    
    try {

        //Amacena las traducciones del script
        const locale = client.locale.handlers.buttons.updateNotifications;

        //Almacena el miembro de la interacción
        const member = await client.functions.utils.fetch('member', interaction.user.id);

        //Almacena si el miembro puede ganar EXP
        let notAuthorized;

        //Almacena los IDs que no pueden ganar punto de EXP
        const wontEarnXP = await client.functions.db.getConfig('leveling.wontEarnXP')

        //Por cada uno de los roles que pueden ganar EXP
        for (let index = 0; index < wontEarnXP.length; index++) {

            //Comprueba si el miembro ejecutor lo tiene
            if (member.roles.cache.has(wontEarnXP[index])) notAuthorized = true; break;
        };

        //Si no está autorizado para ello, devuelve un mensaje de error
        if (notAuthorized) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        //Almacena la acción a realizar determinada por el estilo del botón
        const buttonAction = interaction.message.components[0].components[0].style === discord.ButtonStyle.Secondary ? false : true;

        //Almacena el perfil del miembro, o lo crea
        let memberProfile = await client.functions.db.getData('profile', interaction.user.id) || await client.functions.db.genData('profile', { userId: interaction.user.id });

        //Almacena los ajustes de notificacion del miembro
        let memberSetting = memberProfile.notifications.private;

        //Si la config. ya estaba aplicada
        if ((!buttonAction && !memberSetting) || (buttonAction && memberSetting)) {

            //Avisa de esta situación al usuario
            interaction.user.send({ content: `${client.customEmojis.orangeTick} | ${locale.alreadyApplied}.` }).then(msg => { setTimeout(() => msg.delete(), 3000) });

        } else {

            //Sino, modifica la base de datos con los cambios
            memberSetting.notifications.private = buttonAction;
            await client.functions.db.setData('profile', interaction.user.id, memberProfile);
        };

        //Genera una nueva fila para los botones
        const buttonsRow = new discord.MessageActionRow().addComponents(

            //Genera el nuevo botón
            new discord.MessageButton()
                .setLabel(buttonAction ? locale.newButon.disable : locale.newButon.enable)
                .setStyle(buttonAction ? discord.ButtonStyle.Secondary : discord.ButtonStyle.Success)
                .setCustomId('updateNotifications')
        );

        //Edita la interacción con el nuevo botón
        await interaction.update({ components: [buttonsRow] });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};
