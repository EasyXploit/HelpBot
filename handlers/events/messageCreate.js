export default async (message, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (message.guild && message.guild.id !== client.baseGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

    //Crea un objeto en el cliente para los mensajes de usuarios
    if (!client.userMessages) client.userMessages = {};

    //Si el miembro no tiene entrada en el objeto de mensajes de miembros, la crea
    if (!client.userMessages[message.author.id]) client.userMessages[message.author.id] = {
        history: [],
        lastValidTimestamp: 0
    };

    //Crea una variable para almacenar los mensajes del miembro
    let userMessages = client.userMessages[message.author.id];

    //Si el mensaje tiene contenido
    if (message.content.length > 0) {
        
        //Se genera un hash a partir del contenido del mensaje
        const messageHash = await client.md5(message.content);

        //Añade el mensaje al historial de mensajes del miembro
        userMessages.history.push({
            id: message.id,
            timestamp: message.createdTimestamp,
            editedTimestamp: message.editedTimestamp,
            channelId: message.channel.id,
            channelType: message.channel.type,
            content: message.content,
            hash: messageHash,
        });
    };
    
    //Si el mensaje tiene adjuntos y se desean filtrar
    if (await client.functions.db.getConfig('moderation.filters.crossPost').filterFiles && message.attachments.size > 0) {

        //Se genera un array a partir de los valores de los adjuntos
        const attachmentsArray = Array.from(message.attachments.values());

        //Por cada uno de los adjuntos
        for (let index = 0; index < attachmentsArray.length; index++) {

            //Obtiene el fichero al que hace dirección la URL proxy
            await fetch(attachmentsArray[index].proxyURL).then(async (response) => {

                //Almacena el cuerpo del fichero en formato cadena
                const attachmentBody = await response.text();

                //Genera un hash a partir del cuerpo del fichero
                const attachmentHash = await client.md5(attachmentBody);

                //Añade el hash al historial de mensajes del miembro
                userMessages.history.push({
                    id: message.id,
                    timestamp: message.createdTimestamp,
                    editedTimestamp: message.editedTimestamp,
                    channelId: message.channel.id,
                    channelType: message.channel.type,
                    content: attachmentsArray[index].proxyURL,
                    hash: attachmentHash
                });
            });
        };
    };

    //Almacena el tamaño del historial de mensajes de miembros
    const messageHistorySize = await client.functions.db.getConfig('moderation.messageHistorySize');

    //Si el historial está lleno, elimina el primer elemento del array
    if (userMessages.history.length >= messageHistorySize) userMessages.history.shift();  

    //Comprueba si el contenido del mensaje está permitido
    const isPermitted = await client.functions.moderation.checkMessage(message);

    //Si se trata de un mensaje enviado en una guild y no fue filtrado
    if (message.member && isPermitted) {

        //Almacena el perfil del miembro, o lo crea
        let memberProfile = await client.functions.db.getData('profile', message.member.id) || await client.functions.db.genData('profile', { userId: message.member.id });

        //Incrementa el contador de mensajes enviados del miembro
        memberProfile.stats.messagesCount++;
        
        //Guarda las nuevas estadísticas del miembro en la base de datos
        await client.functions.db.setData('profile', message.member.id, memberProfile);

        //Si el último mensaje que generó EXP fue hace más del periodo establecido
        if (await client.functions.db.getConfig('leveling.rewardMessages') && ((message.createdTimestamp - userMessages.lastValidTimestamp) > await client.functions.db.getConfig('leveling.minimumTimeBetweenMessages'))) {

            //Actualiza el valor del tiempo de última ganancia de EXP
            userMessages.lastValidTimestamp = message.createdTimestamp;

            //Aumenta la cantidad de EXP del miembro
            await client.functions.leveling.addExperience(message.member, 'message', message.channel);
        };
    };
};
