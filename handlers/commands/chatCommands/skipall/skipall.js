exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected',  'same-channel',  'has-queue',  'can-speak'])) return;

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Comprueba si es necesaria una votación y cambia la cola
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'skip-all')) {

            //Elimina la cola de reproducción
            await reproductionQueue.tracks.splice(0, reproductionQueue.tracks.length);
            
            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena el reproductor suscrito
            const player = connection._state.subscription.player;

            //Para el reproductor
            player.stop();

            //Manda un mensaje de confirmación
            await interaction.reply({ content: `⏭ | ${locale.skipped}` });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT'
    }
};
