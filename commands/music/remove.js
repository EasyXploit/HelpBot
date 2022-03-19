exports.run = async (client, message, args, command, commandConfig) => {
    //!remove (posición | all)

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Comprueba si se han proporcionado argumentos
        if (!args[0]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es:\n\`${client.config.main.prefix}${command}${commandConfig.export.parameters.length > 0 ? ' ' + commandConfig.export.parameters : ''}\`.`)
        ]});

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];
        
        if (args[0] === 'all') {

            //Comprueba si es necesaria una votación
            if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'remove-all')) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(1);
                
                //Manda un mensaje de confirmación
                await message.channel.send({ content: `${client.customEmojis.greenTick} | He eliminado todas las canciones de la cola` });
            };

        } else {

            //Comprueba si se ha proporcionado un número entero
            if (isNaN(args[0])) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Debes proporcionar un número entero.`)]
            });
            
            //Comprueba si no es 0
            if (args[0] === '0') return message.channel.send({ content: 'Quieres jugar sucio eh ...' });
            
            //Comprueba si el valor introducido es válido
            if (args[0] >= (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} La pista Nº\`${args[0]}\` no está añadida a la cola.`)]
            });

            //Comprueba si es necesaria una votación
            if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'remove', args[0])) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(args[0], 1);
                
                //Manda un mensaje de confirmación
                await message.channel.send({ content: `${client.customEmojis.greenTick} | He eliminado la pista de la cola` });
            };
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'remove',
    description: 'Elimina una pista de la cola de reproducción.',
    aliases: ['rm'],
    parameters: '<posición | "all">'
};
