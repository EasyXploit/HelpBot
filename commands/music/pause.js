exports.run = async (client, message, args, command, commandConfig) => {
    
    //!pause

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'same-channel'])) return;

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Almacena el reproductor suscrito
        const player = connection._state.subscription.player;

        //Comprueba si el bot ya estaba pausado
        if (player.state.status === 'paused') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot ya está pausado.`)
        ]});

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'pause')) {
            
            //Reanuda la reproducción y manda un mensaje de confirmación
            await player.pause();
            await message.channel.send({ content: `⏸ | Cola pausada` });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'pause',
    aliases: []
};
