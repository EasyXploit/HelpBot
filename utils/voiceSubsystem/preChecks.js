exports.run = async (client, message, checks) => {

    try {
        
        //Variable para almacenar el estado de las comprobaciones
        let passingStatus = true;

        //Comprueba que el bot esté conectado a un canal de voz.
        async function botConnected() {

            //Método para obtener conexiones de voz
            const { getVoiceConnection } = require('@discordjs/voice');

            //Almacena la conexión de voz del bot
            const connection = await getVoiceConnection(message.guild.id);
            
            //Comprueba si el bot tiene o no una conexión a un canal de voz
            if (!connection) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ningún canal.`)]
                });

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el usuario esté conectado a un canal de voz.
        async function userConnection() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si el miembro está en un canal de voz
            if (!voiceChannel) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`)
                ]});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el usuario esté conectado al mismo canal de voz que el bot.
        async function sameChannel() {

            //Comprueba si el miembro está en el mismo canal que el bot
            if (message.guild.me.voice.channel.id !== message.member.voice.channel.id) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`)]
                });

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que haya una cola de reproducción.
        async function hasQueue() {

            //Almacena la información de la cola de la guild
            const reproductionQueue = client.reproductionQueues[message.guild.id];
            
            //Comprueba si hay cola
            if (!reproductionQueue || reproductionQueue.tracks.length <= 0) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} El reproductor está inactivo.`)]
                });

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
            const connection = await getVoiceConnection(message.guild.id);

            //Comprueba si el bot está conectado
            if (connection) {

                //Obtiene el nombre canal de voz
                const voiceChannel = await client.functions.fetchChannel(message.guild, connection.joinConfig.channelId);

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> ya está conectado a \`${voiceChannel.name}\`.`)
                ]});
    
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el canal no sea el de AFK
        async function notAfk() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si el canal no está configurado para AFK
            if (voiceChannel.id === message.guild.afkChannel.id) {
                
                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no puede conectarse al canal de AFK.`)
                ]});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        }

        //Comprueba que el bot tenga permiso para hablar.
        async function canSpeak() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si el bot tiene permiso para hablar
            if (!voiceChannel.speakable) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no tiene permiso para hablar en \`${voiceChannel.name}\`.`)
                ]});

                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el bot tenga permiso para conectarse.
        async function forbiddenChannel() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si el bot tiene prohibido conectarse por config.
            if (client.config.music.forbiddenChannels.includes(voiceChannel.id)) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> tiene prohibido conetarse a \`${voiceChannel.name}\`.`)
                ]});
    
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que la configuración del bot le permita unirse.
        async function canJoin() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si el bot tiene permiso para conectarse
            if (!voiceChannel.joinable) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no tiene permiso para unirse a \`${voiceChannel.name}\`.`)
                ]})
                
                //Devuelve el estado "falso"
                return false;
            };

            //Devuelve el estado "verdadero"
            return true;
        };

        //Comprueba que el canal de voz tenga hueco para el bot.
        async function fullChannel() {

            //Almacena el canal de voz del miembro
            const voiceChannel = message.member.voice.channel;

            //Comprueba si la sala está llena
            if (voiceChannel.full  && (!message.guild.me.voice  || !message.guild.me.voice.channel)) {

                //Devuelve un mensaje de error
                await message.channel.send({ embeds: [new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} El canal de voz \`${voiceChannel.name}\` está lleno.`)
                ]});
    
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
        console.error(`${new Date().toLocaleString()} 》ERROR: ${error.stack}`);
    };
};
