exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../../utils/voice/preChecks.js').run(client, interaction, ['bot-connected',  'same-channel',  'has-queue',  'can-speak'])) return;

        //Almacena el argumento proporcionado por el usuario (si lo hay)
        const argument = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null;

        //Función para omitir la pista y mandar un mensaje de confirmación
        async function skip() {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            let connection = await getVoiceConnection(interaction.guild.id);

            //Almacena el reproductor suscrito
            const player = connection._state.subscription.player;

            //Para el reproductor
            player.stop();

            //Manda un mensaje de confirmación
            await interaction.reply({ content: `⏭ | ${locale.skipped}` });
        };
        
        //Si se especifica una cantidad, se omitirá dicha cantidad
        if (argument) {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];

            //Si hay que omitir todas
            if (argument === 'all') {

                //Comprueba si es necesaria una votación y cambia la cola
                if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'skip-all')) {
                    await reproductionQueue.tracks.splice(0, reproductionQueue.tracks.length);
                    await skip();
                };

            } else {
                
                //Comprueba si está activado el modo aleatorio
                if (reproductionQueue.mode === 'shuffle') return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.cantSkipOnRandom}.`)
                ], ephemeral: true});

                //Comprueba si está activado el modo bucle
                if (reproductionQueue.mode === 'loopsingle' || reproductionQueue.mode === 'loopqueue') return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${cantMultipleOnLoop}.`)
                ], ephemeral: true});
                
                //Comprueba si se ha proporcionado un número entero
                if (!Number.isInteger(parseInt(argument))) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.notInteger}.`)
                ], ephemeral: true});
                
                //Comprueba si no es 0
                if (argument <= 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.belowOne}.`)
                ], ephemeral: true});
                
                //Comprueba si el valor introducido es válido
                if (argument > (reproductionQueue.tracks.length)) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.cantSkipThis, { quantity: reproductionQueue.tracks.length })}.`)
                ], ephemeral: true});
                
                //Comprueba si es necesaria una votación y cambia la cola
                if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, `skip-${argument}`)) {
                    await reproductionQueue.tracks.splice(0, argument - 1);
                    await skip();
                };
            };

        } else {

            //Comprueba si es necesaria una votación y omite
            if (await require('../../../../utils/voice/testQueuePerms.js').run(client, interaction, 'skip', 0)) await skip();
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
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'quantity',
                type: 'STRING',
                required: false
            }
        ]
    }
};