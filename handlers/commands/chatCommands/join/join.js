exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-disconnected', 'user-connection', 'forbidden-channel', 'can-speak', 'not-afk', 'can-join', 'full-channel'])) return;

        //Almacena el canal de voz del miembro
        const voiceChannel = interaction.member.voice.channel;

        //Almacena librerías necesarios para manejar conexiones de voz
        const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

        //Crea una nueva conexión al canal de miembro
        let connection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

		//Comprueba si debe crear el objeto global de colas
		if (!client.reproductionQueues[interaction.guild.id]) client.reproductionQueues[interaction.guild.id] = { boundedTextChannel: null, timeout: null, votes: {}, mode: false, tracks: [] };

        //Almacena el objeto de colas de la guild
		const reproductionQueue = client.reproductionQueues[interaction.guild.id];
	
		//Almacena el canal del mensaje para vincular los mensajes de reproducción
		reproductionQueue.boundedTextChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);

        //Manda un mensaje de confirmación
        interaction.reply({ content: `📥 | ${await client.functions.utilities.parseLocale.run(locale.bounded, { voiceChannel: voiceChannel, textChannel: reproductionQueue.boundedTextChannel })}.` });

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
                delete client.reproductionQueues[interaction.guild.id];
            }
        });

        //Crea un contador para demorar la salida del canal y la destrucción de la cola
        reproductionQueue.timeout = setTimeout(() => {

            //Aborta la conexión
            connection.destroy();

            //Confirma la acción
            reproductionQueue.boundedTextChannel.send({ content: `⏏ | ${locale.leftChannel}` });

            //Borra la información de reproducción del server
            delete client.reproductionQueues[interaction.guild.id];

        }, client.config.music.maxIdleTime);

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
