exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!8ball (pregunta)
    
    try {
        let notToAnswerEmbed = new discord.MessageEmbed()
            .setColor(0xF12F49)
            .setTitle(resources.RedTick + ' Debes preguntarme algo')
            .setDescription('La sintaxis de este comando es `' + config.prefix +'8ball (pregunta)`');
    
        if (!args[0]) return message.channel.send(notToAnswerEmbed);

        const data = ['Concéntrate y pregunta otra vez', 'Ya está decidido', 'Mis fuentes me indican que no', 'Mi respuesta es no', 'Así como lo veo, si', 'Las señales indican que si', 'Lo más probable es que si', 'Lo verdad, no me importa lo más mínimo', '¡Ayúdame! Me tienen encerrado escribiendo frases de mi******', 'Quizás sea posible ... en otro universo', 'Solo si lo pides por favor', 'Para obtener una respuesta, introduzca 1 eur.', 'Pinta chungo', 'GL', 'Tan solo se que no se nada', 'Prueba otra vez', '¿Me lo preguntas enserio?', '¿Te enfadarás si te digo que no?', 'Fuas, si no me lo llegas a decir, no me la sudaba tanto'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xDDDDDD)
            .setDescription(':8ball: | ' + data[Math.floor(Math.random() * data.length)] + ', ' + message.member.displayName);

        message.channel.send(resultEmbed);
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
