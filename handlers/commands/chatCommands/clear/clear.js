exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['bot-connected', 'same-channel', 'has-queue'])) return;

        //Comprueba si es necesaria una votación
        if (await client.functions.reproduction.testQueuePerms.run(client, interaction, 'clear')) {

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
        await client.functions.managers.interactionError(error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};
