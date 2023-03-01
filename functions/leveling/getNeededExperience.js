//Función para calcular la experiencia necesaria para alcanzar el siguiente nivel en base a la experiencia
exports.run = async (client, experience) => {

    //Almacena el 
    let iteratedLevel = 0;

    //Almacena el XP del siguiente nivel
    let nextLevelExperience;

    //Mientras que el XP actual sea mayor o igual que el necesario para subir al siguiente nivel
    while (!nextLevelExperience || experience >= nextLevelExperience) {
        
        //Incrementa el contador de nivel
        if (nextLevelExperience) iteratedLevel++;

        //Actualiza el XP requerido para el siguiente nivel en función del modificador
        nextLevelExperience = Math.round(5 * Math.pow(iteratedLevel, 3) + 50 * iteratedLevel + 100);
    };

    //Devuelve un objeto con la experiencia necesaria y el nivel que se alcanzará
    return { experience: nextLevelExperience - experience, nextLevel: iteratedLevel };
};
