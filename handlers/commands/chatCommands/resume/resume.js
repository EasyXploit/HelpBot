exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected', 'same-channel', 'can-speak'])) return;

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(interaction.guild.id);

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot no estaba pausado
        if (!subscription || subscription.player.state.status !== 'paused') return interaction.reply({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.notPaused}.`)
        ], ephemeral: true});

        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'pause')) {

            //Almacena la información de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[connection.joinConfig.guildId];

            //Si había un timeout de pausa
            if (reproductionQueue.timeout) {

                //Finalzia el timeout
                clearTimeout(reproductionQueue.timeout);

                //Anula la variable dle timeout
                reproductionQueue.timeout = null;
            };

            //Reanuda la reproducción
            await subscription.player.unpause();

            //Manda un mensaje de confirmación
            await interaction.reply({ content: `▶ | ${locale.resumed}` });
        };

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
        type: 'CHAT_INPUT'
    }
};
