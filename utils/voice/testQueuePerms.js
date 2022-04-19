exports.run = async (client, message, command, index) => {

    try {

        //Almacena las traducciones
        const locale = client.locale.utils.voice.testQueuePerms;

        //Omite si no hay roles de DJ
        if (client.config.music.djRoles.length == 0) return true;

        //Almacena la cola de reproducción
        let reproductionQueue = client.reproductionQueues[message.guild.id];

        //Omite si no hay reproducción
        if (!reproductionQueue || !reproductionQueue.tracks[0]) return true;

        //Calcula a qué posición de la cola ha de acceder para realizar comprobaciones
        if (message.member.id === reproductionQueue.tracks[index || 0].requesterId) return true;
        
        //Comprueba si el miembro es DJ, y de serlo omite la comprobación de votos
        for (let index = 0; index < client.config.music.djRoles.length; index++) {
            if (await message.member.roles.cache.find(role => role.id === client.config.music.djRoles[index])) {
                return true;
            };
        };

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
            if (!counter[index].includes(message.member.id)) counter[index].push(message.member.id);

            //Actualiza el contador de votos
            actualVotes = counter[index].length;

        } else {

            //Si el miembro no ha votado, añade su voto
            if (!counter.includes(message.member.id)) counter.push(message.member.id);

            //Actualiza el contador de votos
            actualVotes = counter.length;
        };

        //Graba el nuevo contador de votos
        reproductionQueue.votes[command] = counter;

        //Almacena variables necesarias para calcular los votos
        const memberCount = message.member.voice.channel.members.size - 1;
        const actualPercentage = (actualVotes / memberCount) * 100;
        const requiredPercentage = client.config.music.votesPercentage;
        const requiredVotes = Math.round((actualVotes * requiredPercentage) / actualPercentage);

        //Maneja la cantidad de votos necesarios para realizar la acción
        if (actualPercentage < client.config.music.votesPercentage) {
            message.channel.send({ content: client.functions.localeParser(locale.neededVotes, { actualVotes: actualVotes, requiredVotes: requiredVotes }) });
            return false;
        } else {
            reproductionQueue.votes[command] = 0;
            return true;
        };

    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
    };
};
