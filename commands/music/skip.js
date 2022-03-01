exports.run = async (client, message, args, command, commandConfig) => {
    
    //!skip (cantidad opcional | all)

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected',  'same-channel',  'has-queue',  'can-speak'])) return;

        //Función para omitir la pista y mandar un mensaje de confirmación
        async function skip() {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(message.guild.id);

            //Almacena el reproductor suscrito
            const player = connection._state.subscription.player;

            //Para el reproductor
            player.stop();

            //Manda un mensaje de confirmación
            await message.channel.send({ content: '⏭ | Pista/s omitida/s' });
        };
        
        //Si se especifica una cantidad, se omitirá dicha cantidad
        if (args[0]) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Si hay que omitir todas
            if (args[0] === 'all') {

                //Comprueba si es necesaria una votación y cambia la cola
                if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'skip-all')) {
                    await reproductionQueue.tracks.splice(0, reproductionQueue.tracks.length);
                    await skip();
                };

            } else {
                
                //Comprueba si está activado el modo aleatorio
                if (reproductionQueue.mode === 'shuffle') return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes omitir más de una pista con el modo aleatorio activado.`)]
                });

                //Comprueba si está activado el modo loop
                if (reproductionQueue.mode === 'loop' || reproductionQueue.mode === 'loopqueue') return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes omitir más de una pista con el modo loop activado.`)]
                });
                
                //Comprueba si se ha proporcionado un número entero
                if (isNaN(args[0])) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} Debes proporcionar un número entero.`)]
                });
                
                //Comprueba si no es 0
                if (args[0] === '0') return message.channel.send({ content: 'Quieres jugar sucio eh ...' });
                
                //Comprueba si el valor introducido es válido
                if (args[0] > (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} Solo puedes hacer skip de \`${(reproductionQueue.tracks.length)}\` canciones.`)]
                });
                
                //Comprueba si es necesaria una votación y cambia la cola
                if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, `skip-${args[0]}`)) {
                    await reproductionQueue.tracks.splice(0, args[0] - 1);
                    await skip();
                };
            };

        } else {

            //Comprueba si es necesaria una votación y omite
            if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'skip', 0)) await skip();
        };

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'skip',
    aliases: ['s']
};
