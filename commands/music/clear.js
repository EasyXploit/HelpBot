exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../utils/voice/preChecks.js').run(client, message, ['bot-connected', 'same-channel', 'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../utils/voice/testQueuePerms.js').run(client, message, 'clear')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];

            //Si la cola está vacía, no la borra
            if (!reproductionQueue || reproductionQueue.tracks.length <= 1) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noQueue}.`)
            ]});

            //Borra la cola
            await reproductionQueue.tracks.splice(1);
            
            //Manda un mensaje de confirmación
            await message.channel.send({ content: `🗑️ | ${locale.queueDeleted}` });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'clear',
    aliases: ['cls']
};
