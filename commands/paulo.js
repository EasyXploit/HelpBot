exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!paulo
    
    try {
        const data = ['Hay dos palabras que te abrirán muchas puertas: "Tire y empuje"', 'El café con leche es como el café... pero con leche', 'Estás leyendo palabras que conforman una frase que dice que lo que lees aquí, son palabras de una frase', 'Pasar un minuto contigo, es como pasar 60 segundos contigo', 'Vendo Opel Corsa del 2000', 'El sujetador de mi mujer es súper difícil de desabrochar, si lo llego a saber no me lo pongo', 'Lo único cierto de las frases de Internet, es que tú no puedes confirmar su validez'];

        const resultEmbed = new discord.RichEmbed()
            .setColor(0xDDDDDD)
            .setDescription('🔮 | "' + data[Math.floor(Math.random() * data.length)] + '"')
            .setFooter('- Paulo Coelho', );
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
