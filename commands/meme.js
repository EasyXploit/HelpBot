exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!meme
    
    try {

        const randomPuppy = require("random-puppy");
        const subReddits = ["dankmeme", "meme", "me_irl"];
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        const img = await randomPuppy(random);
        const embed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setTitle(`Meme de /r/${random}`)
            .setURL(`https://reddit.com/r/${random}`)
            .setImage(img);

        message.channel.send(embed);

    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
