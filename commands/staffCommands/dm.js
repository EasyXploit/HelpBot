exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)
    
    try {
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}dm (autor | anonimo) (@usuario | id) (embed | normal) (mensaje a enviar)\``);
        
        if (args.length < 4 || (args[0] !== 'autor' && args[0] !== 'anonimo') || (args[2] !== 'embed' && args[2] !== 'normal')) return message.channel.send(noCorrectSyntaxEmbed);
            
        let noUserEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No has proporcionado un miembro válido`);
        
        //Busca y almacena el miembro
        const member = await resources.fetchMember(message.guild, args[1]);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No puedes entablar una conversación con un bot`);

        if (!member) return message.channel.send(noUserEmbed);
        
        //Devuelve un error si el objetivo es un bot
        if (member.user.bot) return message.channel.send(noBotsEmbed);

        let mode = args[0];
        let type = args[2];
        let body = args.slice(3).join(' ');
        let resultMessage = body;

        await message.delete()
        
        switch (mode) {
            case 'autor':
                if (type === 'embed') {
                    resultMessage = new discord.MessageEmbed()
                        .setAuthor(`Mensaje de ${message.author.tag}`, message.author.avatarURL())
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

        await member.user.send(resultMessage);

        let confirmEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setDescription(`${resources.GreenTick} ¡Mensaje enviado!`);

        await message.channel.send(confirmEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
