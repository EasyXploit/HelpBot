exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!futuro
    
    try {
        
        if (!args[0]) return;
        if (args[0] !== 'paulo' && args[0] !== 'carmen' && args[0] !== 'chiquito') return;

        const paulo = ['Hay dos palabras que te abrirán muchas puertas: "Tire y empuje"'];
        let carmen = [];
        let chiquito = [];
        
        let data;
            
        switch (args[0]) {
            case 'paulo':
                data = torrente[Math.floor(Math.random() * torrente.length)];
                break;
            case 'carmen':
                data = carmen[Math.floor(Math.random() * carmen.length)];
                break;
            case 'chiquito':
                data = chiquito[Math.floor(Math.random() * chiquito.length)];
                break;
        }

        const resultEmbed = new discord.RichEmbed()
            .setColor(0xDDDDDD)
            .setDescription('🔮 | "' + data + '"');

        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
