exports.run = async (client, message, args, command, commandConfig) => {

    //!move (posición 1) (posición 2)

    try {

        //Método para obtener conexiones de voz
        const { getVoiceConnection } = require('@discordjs/voice');

        //Almacena la conexión de voz del bot
        let connection = await getVoiceConnection(message.guild.id);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!connection) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ningún canal.`)]
        });

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)]
        });

        //Almacena el reproductor suscrito
        const subscription = connection._state.subscription;

        //Comprueba si el bot no tiene reproductor suscrito o este se encuentra inactivo
        if (!subscription || subscription.player.state.status === 'idle') return message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La cola de reproducción está vacía.`)]
        });

        //Almacena la información del servidor
        let reproductionQueue = client.reproductionQueues[message.guild.id];
        
        //Comprueba si hay cola
        if (!reproductionQueue || reproductionQueue.tracks.length <= 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No hay nada en la cola.`)]
        });
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es: \`${client.config.guild.prefix}move (posición 1) (posición 2)\``)]
        });

        //Comprueba si se ha proporcionado un número entero
        if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un número entero.`)]
        });
        
        //Comprueba si no es 0
        if (args[0] === '0' || args[1] === '0') return message.channel.send({ content: 'Quieres jugar sucio eh ...' });
        
        //Comprueba si el valor introducido es válido
        if (args[0] > (reproductionQueue.tracks.length) || args[1] > (reproductionQueue.tracks.length)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Valor demasiado grande.`)]
        });

        //Comprueba si es necesaria una votación
        if (await client.functions.testQueuePerms(message, 'move')) {

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
