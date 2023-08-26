//Función para gestionar los errores en las interacciones
export default async (error, interaction) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.interactionError;

    //Se comprueba si el error es provocado por la invocación de una interacción no existente, o por que no se pueden enviar MDs
    if (error.toString().includes('Cannot find module') || error.toString().includes('Cannot send messages to this user')) return;

    //Se muestra el error en consola
    logger.error(error.stack);

    //Envía la excepción al manejador de errores remoto
    client.errorTracker.captureException(error);
    
    //Almacena si el bot tiene permiso para usar emojis externos en el canal de la interacción
    const missingExtEmojisPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.me, ['USE_EXTERNAL_EMOJIS']);

    //Genera un embed de notificación
    const notificationEmbed = new discord.MessageEmbed()
        .setColor(`${await client.functions.db.getConfig('colors.error')}`)
        .setTitle(`${missingExtEmojisPermissions ? '❌' : client.customEmojis.redTick} ${locale.notificationEmbed.title} ...`)
        .setDescription(locale.notificationEmbed.description);

    try {

        //Responde a la interacción con el embed
        await interaction.reply({ embeds: [notificationEmbed], ephemeral: true});

    } catch (error) {

        //Almacena el canal de texto de la interacción
        const interactionChannel = await client.functions.utils.fetch('channel', interaction.channelId);

        //Almacena si el bot tiene los permisos necesarios en el canal de la interacción
        const missingPermissions = await client.functions.utils.missingPermissions(interaction.channel, client.baseGuild.me, ['SEND_MESSAGES', 'EMBED_LINKS']);

        //Envía el embed al canal de texto, si hay permisos
        if (!missingPermissions) interactionChannel.send({ embeds: [notificationEmbed]});
    };
};