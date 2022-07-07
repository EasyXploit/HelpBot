
//Función para comprobar si un miembro tiene permisos para ajustar la cola de reproducción
exports.run = async (client, interaction, command, index) => {

    try {

        //Almacena las traducciones
		const locale = client.locale.functions.reproduction.testQueuePerms;

        //Omite si no hay roles de DJ
        if (client.config.music.unrestrictedUsage.length == 0) return true;

        //Almacena la cola de reproducción
        let reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Omite si no hay reproducción
        if (!reproductionQueue || !reproductionQueue.tracks[0]) return true;

        //Calcula a qué posición de la cola ha de acceder para realizar comprobaciones
        if (interaction.member.id === reproductionQueue.tracks[index || 0].requesterId) return true;

        //Comprueba si el miembro no tiene restricciones a la hora de gestionar la cola
        const hasUnrestrictedUsage = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: client.config.music.unrestrictedUsage });
        
        //Si tiene permiso, omite la comprobación
        if (hasUnrestrictedUsage) return true;

        //Variable necesaria para calcular los votos y los permisos
        let actualVotes;

        //Crea e inicializa el contador de votos raíz si no lo estaba ya
        if (!reproductionQueue.votes[command]) reproductionQueue.votes[command] = [];
        let counter = reproductionQueue.votes[command];

        //Si se activa el modo "por miembro"
        if (index) {

            //Crea e inicializa el contador de votos hijo si no lo estaba ya
            if (!counter[index]) counter[index] = [];

            //Si el miembro no ha votado, añade su voto
            if (!counter[index].includes(interaction.member.id)) counter[index].push(interaction.member.id);

            //Actualiza el contador de votos
            actualVotes = counter[index].length;

        } else {

            //Si el miembro no ha votado, añade su voto
            if (!counter.includes(interaction.member.id)) counter.push(interaction.member.id);

            //Actualiza el contador de votos
            actualVotes = counter.length;
        };

        //Graba el nuevo contador de votos
        reproductionQueue.votes[command] = counter;

        //Almacena variables necesarias para calcular los votos
        const memberCount = interaction.member.voice.channel.members.size - 1;
        const actualPercentage = (actualVotes / memberCount) * 100;
        const requiredPercentage = client.config.music.votesPercentage;
        const requiredVotes = Math.round((actualVotes * requiredPercentage) / actualPercentage);

        //Maneja la cantidad de votos necesarios para realizar la acción
        if (actualPercentage < client.config.music.votesPercentage) {
            const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);
            interactionChannel.send({ content: await client.functions.utilities.parseLocale.run(locale.neededVotes, { actualVotes: actualVotes, requiredVotes: requiredVotes }) });
            return false;
        } else {
            reproductionQueue.votes[command] = 0;
            return true;
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};
