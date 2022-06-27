//Función para aleatorizar un array y obtener n items
exports.run = async (array, quantity) => {

    //Aleatoriza el array
    const shuffledArray = [...array].sort(() => 0.5 - Math.random());
    
    //Devuelve la cantidad elegida de items
    return shuffledArray.slice(0, quantity);
};