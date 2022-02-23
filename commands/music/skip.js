exports.run = async (client, message, args, command, commandConfig) => {
    
    //!skip (cantidad opcional | all)

    try {

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);

        //Comprueba si el bot está conectado
        if (!connection) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no está conectado a ningún canal.`)
        ]});

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)
        ]});

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot no tiene reproductor suscrito o este se encuentra inactivo
        if (!subscription || subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)]
        });

        //Almacena el canal de voz del miembro
        const voiceChannel = message.member.voice.channel;

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable || voiceChannel.id === message.guild.afkChannel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No tengo permiso para hablar en \`${voiceChannel.name}\`.`)
        ]});

        //Función para omitir la pista y mandar un mensaje de confirmación
        async function skip() {
            await message.channel.send({ content: '⏭ | Pista/s omitida/s' });

            //Almacena el reproductor suscrito
            const player = connection._state.subscription.player;

            //Para el reproductor
            player.stop();
        };
        
        //Si se especifica una cantidad, se omitirá dicha cantidad
        if (args[0]) {

            //Almacena la cola de reproducción de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Si hay que omitir todas
            if (args[0] === 'all') {

                //Comprueba si es necesaria una votación y cambia la cola
                if (await client.functions.testQueuePerms(message, 'skip-all')) {
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
                if (await client.functions.testQueuePerms(message, `skip-${args[0]}`)) {
                    await reproductionQueue.tracks.splice(0, args[0] - 1);
                    await skip();
                };
            };

        } else {

            //Comprueba si es necesaria una votación y omite
            if (await client.functions.testQueuePerms(message, 'skip', 0)) await skip();
        };

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'skip',
    aliases: ['s']
};
