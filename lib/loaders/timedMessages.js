//Exporta una función para cargar los mensajes programados
export async function loadTimedMessages() {

    //Aborta si los mensajes programados están deshabilitados
    if (!await client.functions.db.getConfig('system.modules.timedMessages')) return;

    //Almacena la configuración de mensajes programados
    let configuredMessages = await client.functions.db.getConfig('timedMessages.configuredMessages');

    //Función para enviar mensajes temporizados
    async function sendMessage(messageConfig, channel) {

        //Omite este mensaje programado si estaba desactivado
        if (!messageConfig.enabled) return;

        //Almacena el número de día de la semana
        const actualWeekDay = new Date().getDay();

        //Si hoy no se tiene que enviar, aborta
        if (!messageConfig.weekDays.includes(actualWeekDay)) return;

        //Almacena el último envío de este mensaje
        const lastSentMsg = await client.functions.db.getData('sent', messageConfig.hash);

        //Almacena si lo ha encontrado o no
        let msgFound = false;

        //Si se ha enviado el mensaje programado al menos una vez
        if (lastSentMsg) {

            //Si no se ha rebasado el intervalo de tiempo mínimo, aborta
            if ((Date.now() - lastSentMsg.lastSentTimestamp) < (messageConfig.interval - 1000)) return;

            //Busca los N últimos mensajes del canal en busca de un mensaje programado que no haya alcanzado el mínimo de mensajes posteriores
            const lastMessages = await channel.messages.fetch({ limit: messageConfig.minimumMessagesSinceLast });

            //Almacena un array con los IDs de los mensajes
            const messagesIds = Array.from(lastMessages.keys());

            //Por cada mensaje obtenido
            for (let index = 0; index < lastMessages.size; index++) {

                //Almacena el mensaje
                const message = lastMessages.get(messagesIds[index]);

                //Si se encontró el mensaje, para el bucle y cambia el estado de la variable msgFound
                if (message.id === lastSentMsg.id) return msgFound = true;
            };
        };

        //Si se encontró el mensaje, aborta el envío
        if (msgFound) return;

        //Genera el mensaje a enviar
        const timedMessage = await client.functions.utils.assembleMessage({
            content: messageConfig.content,
            embed: messageConfig.embed,
            actionRows: messageConfig.actionRows
        });

        //Comprueba si el bot tiene permiso para enviar mensajes en el canal
        const missingPermissions = await client.functions.utils.missingPermissions(channel, channel.guild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory'], true);

        //Si el bot no disponía de los permisos necesarios
        if (missingPermissions) {

            //Deshabilita el mensaje temporizado
            messageConfig.enabled = false;

            //Actualiza la base de datos con los cambios
            await client.functions.db.setConfig('timedMessages.configuredMessages', configuredMessages);

            //Informa de la situación
            logger.warn('The bot didn\'t have sufficient permissions to send a timed message in its configured channel, so it has been disabled. The following permissions are needed: Send Messages, Embed Links, Attach Files and Read Message History');

            //Aborta el resto de la función
            return false;
        };

        //Envía el mensaje al canal especificado
        const sentMsg = await channel.send(timedMessage);

        //Busca el mensaje enviado previamente en la base de datos
        const previousMessage = await client.functions.db.getData('sent', messageConfig.hash);

        //Si el mensaje programado se envió previamente
        if (previousMessage) {

            //Actualiza la BD para guardar el ID del último mensaje enviado
            await client.functions.db.setData('sent', messageConfig.hash, {
                messageId: sentMsg.id,
                lastSentTimestamp: Date.now()
            });

        } else {

            //Añade una entrada a la BD para este envío
            await client.functions.db.genData('sent', {
                hash: messageConfig.hash,
                messageId: sentMsg.id,
                lastSentTimestamp: Date.now()
            });
        };
    };

    //Por cada uno de los mensajes programados configurados
    for (let configuredMessage of configuredMessages) {

        //Omite este mensaje programado si estaba desactivado
        if (!configuredMessage.enabled) return;

        //Si todavía no tiene un hash
        if (!configuredMessage.hash) {

            //Genera el mensaje a incluir en el hash
            const timedMessage = await client.functions.utils.assembleMessage({
                content: configuredMessage.content,
                embed: configuredMessage.embed,
                actionRows: configuredMessage.actionRows
            });

            //Genera un objeto con todo lo necesario para el hash
            const timedMessageData = {
                'channelId': configuredMessage.channelId,
                'interval': configuredMessage.interval,
                'weekDays': configuredMessage.weekDays,
                'minimumMessagesSinceLast': configuredMessage.minimumMessagesSinceLast,
                'message': timedMessage
            };

            //Genera un hash MD5 a partir de la configuración del mensaje programado
            configuredMessage.hash = await client.md5(JSON.stringify(timedMessageData));

            //Actualiza la base de datos con los cambios
            await client.functions.db.setConfig('timedMessages.configuredMessages', configuredMessages);
        };

        //Busca el canal especificado en la configiguración del mensaje
        const channel = await client.functions.utils.fetch('channel', configuredMessage.channelId);

        //Omite la iteración si no encuentra el mensaje
        if (!channel) continue;

        //Envía el mensaje al menos una vez
        sendMessage(configuredMessage, channel);

        //Programa un intervalo para enviar el timer
        setInterval(async () => { sendMessage(configuredMessage, channel) }, configuredMessage.interval);
    };

    //Almacena los mensajes programados enviados
    const sentTimedMessaged = await client.functions.db.getData('sent');

    //Por cada uno de los mensajes enviados
    for (const sent of sentTimedMessaged) {

        //Si la configuración asociada ta no existe
        if (!configuredMessages[sent.hash]) {

            //Lo borra la base de datos
            await client.functions.db.delData('sent', sent.hash);
        };
    };

    //Envía una notificación a la consola
    logger.debug('Timed messages loading completed');
};
