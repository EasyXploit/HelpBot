exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {

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

    let successEmbed = new discord.RichEmbed()
        .setTitle('Datos sobre perros  🐕')
        .setColor(0x968976)
        .setDescription(randomTexts())
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setImage(randomImages());
    message.channel.send(successEmbed);
}
