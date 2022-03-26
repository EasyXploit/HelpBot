exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Comprueba si se ha proporcionado un número entero
        if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un número entero.`)]
        });
        
        //Comprueba si no es 0
        if (args[0] === '0' || args[1] === '0') return message.channel.send({ content: 'Quieres jugar sucio eh ...' });

        //Almacena la información de la cola de la guild
        const reproductionQueue = client.reproductionQueues[message.guild.id];
        
        //Comprueba si el valor introducido es válido
        if (args[0] > (reproductionQueue.tracks.length) || args[1] > (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Valor demasiado grande.`)]
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
            await message.channel.send({ content: `${client.customEmojis.greenTick} | He reubicado la pista en la cola` });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'move',
    description: 'Modifica la posición de una pista en la cola.',
    aliases: ['mv'],
    parameters: '<posición 1> <posición 2>'
};
