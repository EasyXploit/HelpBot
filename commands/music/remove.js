exports.run = async (client, message, args, command, commandConfig, locale) => {
    //!remove (posición | all)

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected',  'same-channel',  'has-queue'])) return;

        //Comprueba si se han proporcionado argumentos
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];
        
        if (args[0] === 'all') {

            //Comprueba si es necesaria una votación
            if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'remove-all')) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(1);
                
                //Manda un mensaje de confirmación
                await message.channel.send({ content: `${client.customEmojis.greenTick} | ${locale.allDeleted}` });
            };

        } else {

            //Comprueba si se ha proporcionado un número entero
            if (!Number.isInteger(args[0])) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.nonInt}.`)]
            });
            
            //Comprueba si no es 0
            if (args[0] === '0') return message.channel.send({ content: locale.belowOne });
            
            //Comprueba si el valor introducido es válido
            if (args[0] >= (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.doesntExist, { number: args[0] })}.`)]
            });

            //Comprueba si es necesaria una votación
            if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'remove', args[0])) {

                //Elimina el elemento de la cola
                await reproductionQueue.tracks.splice(args[0], 1);
                
                //Manda un mensaje de confirmación
                await message.channel.send({ content: `🗑️ | ${locale.deletedTrack}` });
            };
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'remove',
    aliases: ['rm']
};
