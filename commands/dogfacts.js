exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!dogfacts
    
    try {
        const texts = require('../resources/texts/dogfacts.json');
        const images = require('../resources/images/dogs/dogs.json');

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

        let resultEmbed = new discord.MessageEmbed()
            .setColor(0x968976)
            .setImage(randomImages())
            .setTitle('Datos sobre perros  🐕')
            .setDescription(randomTexts())
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
