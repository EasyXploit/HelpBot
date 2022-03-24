exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-disconnected', 'user-connection', 'forbidden-channel', 'can-speak', 'not-afk', 'can-join', 'full-channel'])) return;

        //Almacena el canal de voz del miembro
        const voiceChannel = message.member.voice.channel;

        //Almacena librerías necesarios para manejar conexiones de voz
        const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

        //Crea una nueva conexión al canal de miembro
        let connection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

		//Comprueba si debe crear el objeto global de colas
		if (!client.reproductionQueues[message.guild.id]) client.reproductionQueues[message.guild.id] = { boundedTextChannel: null, timeout: null, votes: {}, mode: false, tracks: [] };

        //Almacena el objeto de colas de la guild
		const reproductionQueue = client.reproductionQueues[message.guild.id];
	
		//Almacena el canal del mensaje para vincular los mensajes de reproducción
		reproductionQueue.boundedTextChannel = message.channel;

        //Manda un mensaje de confirmación
        message.channel.send({ content: `📥 | Unido a \`${voiceChannel.name}\` y vinculado a ${message.channel}.` });

        //Si la conexión desaparece
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                //Comprueba si solo se trataba de una reconexión a otro canal, para ignorarlo
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                ]);
            } catch (error) {//Parece ser una desconexión real de la que no debe recuperarse

                //Aborta la conexión
                connection.destroy();

                //Borra la información de reproducción de la guild
                delete client.reproductionQueues[message.guild.id];
            }
        });

        //Crea un contador para demorar la salida del canal y la destrucción de la cola
        reproductionQueue.timeout = setTimeout(() => {

            //Aborta la conexión
            connection.destroy();

            //Confirma la acción
            message.channel.send({ content: '⏏ | He abandonado el canal' });

            //Borra la información de reproducción del server
            delete client.reproductionQueues[message.guild.id];

        }, client.config.music.maxIdleTime);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'join',
    description: 'Conecta al bot a tu canal de voz.',
    aliases: ['j'],
    parameters: ''
};
