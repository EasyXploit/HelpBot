exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Envía un mensaje de error si no se ha proporcionado un parámetro (comando)
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //En función del comando especificado
        switch (args[0]) {
            
            case 'welcome': //Emite el evento "guildMemberAdd"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.memberNotProvided}.`)
                ]});

                //Busca el miembro en la guild
                const targetWelcomeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetWelcomeMember) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.invalidMember}.`)
                ]});
                
                //Emite el evento
                await client.emit('guildMemberAdd', targetWelcomeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.welcome.done}`)
                ]}).then(msg => {setTimeout(() => msg.delete(), 2000)});

                //Para la ejecución
                break;
        
            case 'goodbye': //Emite el evento "guildMemberRemove"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.memberNotProvided}.`)
                ]});

                //Busca el miembro en la guild
                const targetGoodybeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetGoodybeMember) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.invalidMember}.`)
                ]});
                
                //Emite el evento
                await client.emit('guildMemberRemove', targetGoodybeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.goodbye.done}`)
                ]}).then(msg => {setTimeout(() => msg.delete(), 2000)});

                //Para la ejecución
                break;
            
            default: //En caso de que no se haya proporcionado un comando existente

                //Envía un mensaje de error
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.invalidCommand}.`)
                ]});

                //Para la ejecución
                break;
        };
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'run',
    aliases: ['execute', 'exec']
};
