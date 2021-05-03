exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)
    
    try {

        if (message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed);
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}broadcast (autor | anonimo) (embed | normal) (mensaje a enviar)\``);
        
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
                        .setColor(resources.gold)
                        .setDescription(body);
                } else if (type === 'normal') {
                    resultMessage = `**Mensaje de ${message.author.tag}:**\n${resultMessage}`
                }
                break;
            case 'anonimo':
                if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setColor(resources.gold)
                        .setDescription(body);
                }
                break;
        };

        let sendingEmbed = new discord.MessageEmbed()
            .setColor(resources.gray)
            .setDescription(`${resources.GrayTick} El mensaje está siendo enviado`);

        let confirmEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setDescription(`${resources.GreenTick} ¡Mensaje enviado!`);
            
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
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
