exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!choose "opción1" "opción2" ...
    
    try {
        let notToAnswerEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionarme al menos 2 opciones.\nLa sintaxis de este comando es \`${client.config.guild.prefix}choose "opción1" "opción2" ...\``);

        let options = message.content.slice(8).split('" "');
        let lastOption = options.slice(-1).join();

        lastOption = lastOption.substring(0, lastOption.length - 1);
        options.splice(-1);
        options.push(lastOption);

        if (!options[0] || !options[1]) return message.channel.send(notToAnswerEmbed);

        const texts = ['parece buena opción', 'suena bien', 'parece la opción más viable', ', me decantaré por esta opción', 'es para noobs, osea que la otra'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0x98DBCC)
            .setDescription(`🎯 | _"${options[Math.floor(Math.random() * options.length)]}"_ ${texts[Math.floor(Math.random() * texts.length)]} ${message.member.displayName}`);

        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'choose',
    aliases: ['select']
};