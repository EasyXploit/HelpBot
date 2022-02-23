exports.run = async (client, message, args, command, commandConfig) => {
    
    //!pause

    try {

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Comprueba si el bot está conectado
        if (!connection || connection._state.status === 'disconnected') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está conectado.`)
        ]});

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)
        ]});

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
