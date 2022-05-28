exports.run = async (client, interaction) => {

    try {

        //Respuesta de prueba
        interaction.reply({content: `${client.customEmojis.greenTick} Comando de prueba.`});

    } catch (error) {

        //Devuelve un error en la consola
        console.error(`${new Date().toLocaleString()} 》ERROR: `, error.stack);
    };
};

module.exports.config = {
    type: 'guild',
    appData: {
        type: 'MESSAGE',
        name: 'TestMessageCommand'
    }
};
