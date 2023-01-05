//Función para gestionar los errores en las interacciones
exports.run = async (client, error, interaction) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.interactionError;

    //Se comprueba si el error es provocado por la invocación de una interacción no existente, o por que no se pueden enviar MDs
    if (error.toString().includes('Cannot find module') || error.toString().includes('Cannot send messages to this user')) return;

    //Se muestra el error en consola
    console.error(`\n${new Date().toLocaleString()} 》${locale.error}:`, error.stack);

    //Almacena el string del error, y lo recorta si es necesario
    const errorString = error.stack.length > 1014 ? `${error.stack.slice(0, 1014)} ...` : error.stack;

    //Almacena los argumentos de la interacción
    const args = JSON.stringify(interaction.options._hoistedOptions);

    //Almacena el string de los argumentos, y lo recorta si es necesario
    const argsString = args.length > 1014 ? `${args.slice(0, 1014)} ...` : args;

    //Se almacena el nombre del comando (si procede)
    const commandName = interaction.commandName ? interaction.commandName : locale.noCommandName;

    //Se comprueba si se han proporcionado parámetros
    const arguments = interaction.options._hoistedOptions[0] ? `\`\`\`${argsString}\`\`\`` : locale.noArguments;

    //Genera un embed de notificación
    const notificationEmbed = new client.MessageEmbed()
        .setColor(client.config.colors.error)
        .setTitle(`${client.customEmojis.redTick} ${locale.notificationEmbed.title} ...`)
        .setDescription(locale.notificationEmbed.description);

    try {

        //Responde a la interacción con el embed
        await interaction.reply({ embeds: [notificationEmbed], ephemeral: true});

    } catch (error) {

        //Almacena el canal de texto de la interacción
        const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);

        //Envía el embed al canal de texto
        interactionChannel.send({ embeds: [notificationEmbed]});
    };
};