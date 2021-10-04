exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)
    
    try {
        
        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)\``);
        
        if (args.length < 3 || (args[0] !== 'autor' && args[0] !== 'anonimo') || (args[1] !== 'embed' && args[1] !== 'normal')) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
            
        let mode = args[0];
        let type = args[1];
        let body = args.slice(2).join(' ');
        let resultMessage = body;
        
        switch (mode) {
            case 'autor':
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setAuthor(`Mensaje de: ${message.author.tag}`, message.author.avatarURL())
                        .setColor(client.config.colors.primary)
                        .setDescription(body);
                } else if (type === 'normal') {
                    resultMessage = `**Mensaje de ${message.author.tag}:**\n${resultMessage}`
                }
                break;
            case 'anonimo':
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setColor(client.config.colors.primary)
                        .setDescription(body);
                }
                break;
        };

        let sendingEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.information)
            .setDescription(`${client.customEmojis.grayTick} El mensaje está siendo enviado`);

        let confirmEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.correct2)
            .setDescription(`${client.customEmojis.greenTick} ¡Mensaje enviado!`);
            
        await message.channel.send({ embeds: [sendingEmbed] });

        let i = 0;
        let interval = setInterval(function(){
            let member = message.guild.members.cache.array()[i]
            if (!member.user.bot) member.user.send({ embeds: [resultMessage] })
                .then(console.log(`${new Date().toLocaleString()} 》Mensaje de broadcast enviado a ${member.user.tag}`));
            i++;
            if(i === message.guild.members.cache.array().length) {
                clearInterval(interval);
                message.channel.send({ embeds: [confirmEmbed] });
            }
        }, 10000);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'broadcast',
    aliases: []
};
