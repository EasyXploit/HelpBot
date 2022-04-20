exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Comprueba si se ha proporcionado un número entero
        if (!Number.isInteger(args[0]) || !Number.isInteger(args[1])) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.notInteger}.`)]
        });
        
        //Comprueba si no es 0
        if (args[0] === '0' || args[1] === '0') return message.channel.send({ content: locale.belowOne });

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];
        
        //Comprueba si el valor introducido es válido
        if (args[0] > (reproductionQueue.tracks.length) || args[1] > (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.tooHigh}.`)]
        });

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'move')) {

            //Obtiene el objeto a desplazar
            let toMove = reproductionQueue.tracks[args[0]];
            
            //Elimina el objeto
            reproductionQueue.tracks.splice(args[0], 1);
            
            //Lo vuelve a introducir en la ubicación especificada
            reproductionQueue.tracks.splice(args[1], 0, toMove);
            
            //Manda un mensaje de confirmación
            await message.channel.send({ content: `${client.customEmojis.greenTick} | ${locale.movedTrack}` });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'move',
    aliases: ['mv']
};
