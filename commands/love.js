exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!love (member)
    
    try {
        let member = await resources.fetchMember(message.guild, args[0]);

        if (!member) member = message.guild.members.cache.filter(m => m.id !== message.author.id).random();


        const love = Math.random() * 100;
        const loveIndex = Math.floor(love / 10);
        const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

        const resultEmbed = new discord.MessageEmbed()
            .setColor('#ffb6c1')
            .setTitle(`💟 | Test de compatibilidad:`)
            .setDescription(`El amor de ${member} por ${message.member}:\n${loveLevel} ${Math.floor(love)}%`);

        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
