//Importa los cargadores
import { loadEmojis, loadCommands, loadIntervals, loadTimedMessages } from 'helpbot/loaders';

//Exporta una función para iniciar la carga completa del bot
export async function loadSystem(locale) {

    try {

        //Almacena la guild base en memoria
        client.baseGuild = await client.guilds.cache.get(await client.functions.db.getConfig('system.baseGuildId'));

        //Notifica que la carga de la guild base se ha completado
        logger.debug('Base guild loading completed');

        //Carga los customEmojis en el cliente
        await loadEmojis();

        //Carga de comandos en memoria
        await loadCommands();

        //Carga la presencia del bot
        await client.functions.managers.updatePresence();

        //Notifica la correcta carga de la presencia
        logger.debug('Presence loading completed');

        //Carga los scripts que funcionan a intervalos
        await loadIntervals();

        //Carga los temporizadores configurados
        await loadTimedMessages();

        //Carga los estados de voz (si se su monitorización)
        if (await client.functions.db.getConfig('leveling.rewardVoice')) {

            //Almacena la caché de los estados de voz
            let voiceStates = client.baseGuild.voiceStates.cache;

            //Crea un objeto en el cliente para los estados de voz de los usuarios
            if (!client.usersVoiceStates) client.usersVoiceStates = {};

            //Para cada estado de voz
            voiceStates.forEach(async voiceState => {

                //Almacena el miembro, si lo encuentra
                const member = await client.functions.utils.fetch('member', voiceState.id);
                if (!member) return;

                //Comprueba si en el canal no se puede ganar XP
                if (member.user.bot || (voiceState.guild.afkChannelId && voiceState.channelId === voiceState.guild.afkChannelId)) {
                    if (client.usersVoiceStates[voiceState.id]) {

                        //Borra el registro del miembro que ha dejado el canal de voz
                        delete client.usersVoiceStates[voiceState.id];
                    };
                    return;
                };

                //Crea el objeto de estado de voz
                if (client.usersVoiceStates[voiceState.id]) client.usersVoiceStates[voiceState.id].channelId = voiceState.channelId
                else  {
                    client.usersVoiceStates[voiceState.id] = {
                        guild: voiceState.guild.id,
                        channelID: voiceState.channelId,
                        lastXpReward: Date.now()
                    };
                };
            });

            //Notifica la correcta carga de los estados de voz
            logger.debug('Voice states loading completed');
        };

        //Indica que el bot está listo para manejar eventos
        global.readyStatus = true;

        //Notifica la correcta carga del bot
        logger.info(`${await client.functions.utils.parseLocale(locale.loadedCorrectly, { botUsername: client.user.username })}\n`);

    } catch (error) {

        //Envía un mensaje de error a la consola
        logger.error(error.stack);
    };
};
