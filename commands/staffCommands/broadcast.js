exports.run = async (discord, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //-broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)
    
    try {

        if (message.author.id !== client.config.guild.botOwner) return message.channel.send(noPrivilegesEmbed);
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} La sintaxis de este comando es \`${client.config.prefixes.ownerPrefix}broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)\``);
        
        if (args.length < 3 || (args[0] !== 'autor' && args[0] !== 'anonimo') || (args[1] !== 'embed' && args[1] !== 'normal')) return message.channel.send(noCorrectSyntaxEmbed);
            
        let mode = args[0];
        let type = args[1];
        let body = args.slice(2).join(' ');
        let resultMessage = body;

        await message.delete()
        
        switch (mode) {
            case 'autor':
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setAuthor(`Mensaje de: ${message.author.tag}`, message.author.avatarURL())
                        .setColor(client.colors.gold)
                        .setDescription(body);
                } else if (type === 'normal') {
                    resultMessage = `**Mensaje de ${message.author.tag}:**\n${resultMessage}`
                }
                break;
            case 'anonimo':
                if (message.author.id !== client.config.guild.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setColor(client.colors.gold)
                        .setDescription(body);
                }
                break;
        };

        let sendingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gray)
            .setDescription(`${client.emotes.grayTick} El mensaje está siendo enviado`);

        let confirmEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setDescription(`${client.emotes.greenTick} ¡Mensaje enviado!`);
            
        await message.channel.send(sendingEmbed);

        let i = 0;
        let interval = setInterval(function(){
            let member = message.guild.members.cache.array()[i]
            if (!member.user.bot) member.user.send(resultMessage)
                .then(console.log(`${new Date().toLocaleString()} 》Mensaje de broadcast enviado a ${member.user.tag}`));
            i++;
            if(i === message.guild.members.cache.array().length) {
                clearInterval(interval);
                message.channel.send(confirmEmbed);
            }
        }, 10000);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};
