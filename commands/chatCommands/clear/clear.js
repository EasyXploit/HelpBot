exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected', 'same-channel', 'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await require('../../../utils/voice/testQueuePerms.js').run(client, interaction, 'clear')) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Si la cola está vacía, no la borra
            if (!reproductionQueue || reproductionQueue.tracks.length <= 1) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noQueue}.`)
            ], ephemeral: true});

            //Borra la cola
            await reproductionQueue.tracks.splice(1);
            
            //Manda un mensaje de confirmación
            await interaction.reply({ content: `🗑️ | ${locale.queueDeleted}` });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT'
    }
};
