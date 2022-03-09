exports.run = async (client, message, args, command, commandConfig) => {

    //!move (posición 1) (posición 2)

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voiceSubsystem/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es: \`${client.config.main.prefix}move (posición 1) (posición 2)\`.`)]
        });

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
        if (await require('../../utils/voiceSubsystem/testQueuePerms.js').run(client, message, 'move')) {

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
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'move',
    aliases: ['mv']
};
