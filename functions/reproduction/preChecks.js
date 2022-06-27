//Función para realizar comprobaciones previas antes de reproducir audio
exports.run = async (client, interaction, checks) => {

    try {

        //Almacena las traducciones
		const locale = client.locale.functions.reproduction.preChecks;
        
        //Variable para almacenar el estado de las comprobaciones
        let passingStatus = true;

        //Comprueba que el bot esté conectado a un canal de voz.
        async function botConnected() {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            const connection = await getVoiceConnection(interaction.guild.id);
            
            //Comprueba si el bot tiene o no una conexión a un canal de voz
            if (!connection) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.botNotConnected, { botUser: client.user })}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el usuario esté conectado a un canal de voz.
        async function userConnection() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si el miembro está en un canal de voz
            if (!voiceChannel) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.notConnected}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el usuario esté conectado al mismo canal de voz que el bot.
        async function sameChannel() {

            //Comprueba si el miembro está en el mismo canal que el bot
            if (interaction.guild.me.voice.channel.id !== interaction.member.voice.channel.id) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.notSameChannel, { botUser: client.user })}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que haya una cola de reproducción.
        async function hasQueue() {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[interaction.guild.id];
            
            //Comprueba si hay cola
            if (!reproductionQueue || reproductionQueue.tracks.length <= 0) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.inactive}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el bot NO esté conectado a un canal de voz.
        async function botDisconnected() {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            const connection = await getVoiceConnection(interaction.guild.id);

            //Comprueba si el bot está conectado
            if (connection) {

                //Obtiene el nombre canal de voz
                const voiceChannel = await client.functions.fetchChannel(connection.joinConfig.channelId);

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.alreadyConnected, { botUser: client.user, voiceChannel: voiceChannel })}.`)
                ], ephemeral: true});
    
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el canal no sea el de AFK
        async function notAfk() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si el canal no está configurado para AFK
            if (voiceChannel.id === interaction.guild.afkChannel.id) {
                
                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.isAfk, { botUser: client.user })}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el bot tenga permiso para hablar.
        async function canSpeak() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.cantSpeak, { botUser: client.user, voiceChannel: voiceChannel })}.`)
                ], ephemeral: true});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el bot tenga permiso para conectarse.
        async function forbiddenChannel() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si el bot tiene prohibido conectarse por config.
            if (client.config.music.forbiddenChannels.includes(voiceChannel.id)) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.forbiddenJoin, { botUser: client.user, voiceChannel: voiceChannel })}.`)
                ], ephemeral: true});
    
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que la configuración del bot le permita unirse.
        async function canJoin() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si el bot tiene permiso para conectarse
            if (!voiceChannel.joinable) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.cantJoin, { botUser: client.user, voiceChannel: voiceChannel })}.`)
                ], ephemeral: true})
                
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el canal de voz tenga hueco para el bot.
        async function fullChannel() {

            //Almacena el canal de voz del miembro
            const voiceChannel = interaction.member.voice.channel;

            //Comprueba si la sala está llena
            if (voiceChannel.full  && (!interaction.guild.me.voice  || !interaction.guild.me.voice.channel)) {

                //Devuelve un mensaje de error
                await interaction.reply({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.fullChannel, { voiceChannel: voiceChannel })}.`)
                ], ephemeral: true});
    
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Para cada comprobación solicitada
        for (let index = 0; index < checks.length; index++) {

            //Almacena la comprobación actual
            const check = checks[index];

            //Ejecuta el filtro correspondiente
            switch (check) {
                case 'user-connection':     passingStatus = await userConnection();     break;
                case 'same-channel':        passingStatus = await sameChannel();        break;
                case 'has-queue':           passingStatus = await hasQueue();           break;
                case 'bot-disconnected':    passingStatus = await botDisconnected();    break;
                case 'not-afk':             passingStatus = await notAfk();             break;
                case 'can-speak':           passingStatus = await canSpeak();           break;
                case 'can-join':            passingStatus = await canJoin();            break;
                case 'forbidden-channel':   passingStatus = await forbiddenChannel();   break;
                case 'full-channel':        passingStatus = await fullChannel();        break;
                case 'bot-connected':       passingStatus = await botConnected();       break;
                default:                                                                break;
            };

            //Para el bucle si una prueba falló
            if (!passingStatus) break;
        };

        //Devuelve el estado de las comprobaciones
        return passingStatus;

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};
