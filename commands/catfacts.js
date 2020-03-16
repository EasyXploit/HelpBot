exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!catfacts
    
    try {
        const texts = require('../resources/texts/catfacts.json');
        const images = require('../resources/images/cats/cats.json');

        function randomTexts () {
            let factsKeys = Object.keys(texts);
            let random = Math.floor(Math.random() * factsKeys.length);
            let randomFact = factsKeys[random];
            let path = texts[randomFact];
            return path;
        }

        function randomImages () {
            let imagesKeys = Object.keys(images);
            let random = Math.floor(Math.random() * imagesKeys.length);
            let randomImage = imagesKeys[random];
            let image = images[randomImage];
            return image;
        }

        let resultEmbed = new discord.RichEmbed()         
            .setColor(0xA7A5C6)
            .setImage(randomImages())
            .setTitle('Datos sobre gatos  🐈')
            .setDescription(randomTexts())
        message.channel.send(resultEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
