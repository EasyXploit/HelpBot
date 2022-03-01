exports.run = async (client, message, command, index) => {

    //Omite si no hay roles de DJ
    if (client.config.music.djRoles.length == 0) return true;

    let reproductionQueue = client.reproductionQueues[message.guild.id];

    //Omite si no hay reproducción
    if (!reproductionQueue || !reproductionQueue.tracks[0]) return true;

    //Calcula a qué posición de la cola ha de acceder para realizar comprobaciones
    if (message.member.id === reproductionQueue.tracks[index].requesterId) return true;
    
    //Comprueba si el miembro es DJ, y de serlo omite la comprobación de votos
    for (let i = 0; i < client.config.music.djRoles.length; i++) {
        if (await message.member.roles.cache.find(r => r.id === client.config.music.djRoles[i])) {
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
        if (!counter[index]) counter[index] = []; //Crea e inicializa el contador de votos hijo si no lo estaba ya
        if (!counter[index].includes(message.member.id)) counter[index].push(message.member.id); //Si el miembro no ha votado, añade su voto
        actualVotes = counter[index].length; //Actualiza el contador de votos
    } else {
        if (!counter.includes(message.member.id)) counter.push(message.member.id); //Si el miembro no ha votado, añade su voto
        actualVotes = counter.length; //Actualiza el contador de votos
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
        message.channel.send({ content: `🗳 | Votos necesarios: \`${actualVotes}\` de \`${requiredVotes}\`` });
        return false;
    } else {
        reproductionQueue.votes[command] = 0;
        return true;
    };
};
