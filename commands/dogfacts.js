exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    const texts = require("../resources/texts/dogfacts.json");
    const images = require("../resources/images/dogs/dogs.json");

    function randomTexts () {

        let factsKeys = Object.keys(texts)
        let random = Math.floor(Math.random() * factsKeys.length)
        let randomFact = factsKeys[random]
        let path = texts[randomFact]

        return path;
    }

    function randomImages () {

        let imagesKeys = Object.keys(images)
        let random = Math.floor(Math.random() * imagesKeys.length)
        let randomImage = imagesKeys[random]
        let image = images[randomImage]

        return image;
    }

    let embed = new discord.RichEmbed()
        .setTitle("Datos sobre perros  🐕")

        .setColor(16754772)
        .setDescription(randomTexts())
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .setImage(randomImages())
    message.channel.send({embed})

    .catch ((err) => {
        console.error(new Date() + " 》" + err);

        let embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTitle("❌ Ocurrió un error")
            .setDescription("Ocurrió un error durante la ejecución del comando")
        message.channel.send({embed})
    })
}
