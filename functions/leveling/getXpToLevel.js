//Función para calcular el XP necesario para obtener un nivel determinado
exports.run = async (client, level) => {

    //Devuelve el resultado
    return (5 * client.config.leveling.dificultyModifier) * Math.pow((level - 1), 3) + 50 * (level - 1) + 100;
};