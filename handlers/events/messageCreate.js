exports.run = async (message,locale) => {

    //Aborta si no es un evento de la guild registrada
    if (message.guild && message.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

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
    if (client.config.automodFilters['crossPost'].filterFiles && message.attachments.size > 0) {

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

    //Si el historial está lleno, elimina el primer elemento del array
    if (userMessages.history.length >= client.config.main.messageHistorySize) userMessages.history.shift();  

    //Comprueba si el contenido del mensaje está permitido
    const isPermitted = await client.functions.moderation.checkMessage.run(message);

    //Si se trata de un mensaje enviado en una guild y no fue filtrado
    if (message.member && isPermitted) {

        //Si el miembro no tiene tabla de estadísticas
        if (!client.db.stats[message.member.id]) {

            //Crea la tabla del miembro
            client.db.stats[message.member.id] = {
                experience: 0,
                level: 0,
                aproxVoiceTime: 0,
                messagesCount: 0,
                notifications: {
                    public: true,
                    private: true
                }
            };
        };

        //Almacena las stats del miembro
        const memberStats = client.db.stats[message.member.id];

        //Incrementa el contador de mensajes enviados del miembro
        memberStats.messagesCount++;
        
        //Guarda las nuevas estadísticas del miembro en la base de datos
        client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
            if (err) throw err;
        });

        //Si el último mensaje que generó EXP fue hace más del periodo establecido
        if (client.config.leveling.rewardMessages && ((message.createdTimestamp - userMessages.lastValidTimestamp) > client.config.leveling.minimumTimeBetweenMessages)) {

            //Actualiza el valor del tiempo de última ganancia de EXP
            userMessages.lastValidTimestamp = message.createdTimestamp;

            //Aumenta la cantidad de EXP del miembro
            await client.functions.leveling.addExperience.run(message.member, 'message', message.channel);
        };
    };
};
