exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Respuesta de prueba
        interaction.reply({content: `${client.customEmojis.greenTick} Comando de prueba.`});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: false,
    appData: {
        type: 'USER'
    }
};
