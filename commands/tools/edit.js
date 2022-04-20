exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {
    
        //Comprueba si los parámetros se han proporcionado correctamente
        if (!args[0] || !args[1] || !args[2]) return await client.functions.syntaxHandler(message.channel, commandConfig);
            
        //Busca el canal en la guild
        const channel = await client.functions.fetchChannel(message.guild, args[0]);

        //Almacena la descripción del embed de notificación de canal inexistente
        const noChannelEmbedDescription = !isNaN(args[0]) ? client.functions.localeParser(locale.noChannel.id, { id: args[0] }) : client.functions.localeParser(locale.noChannel.mention, { channel: args[0] });

        //Devuelve un error si no se ha encontrado el canal
        if (!channel) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${noChannelEmbedDescription}.`)
        ]});
        
        //Busca el mensaje en el canal
        const msg = await client.functions.fetchMessage(args[1], channel)
        if (!msg) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.msgNotFound, { msgId: args[1] })}.`)
        ]});

        //Comprueba si el mensaje es del bot
        if (msg.author.id !== client.user.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.cantEdit}.`)
        ]});

        //Almacena el nuevo cuerpo del mensaje
        const newContent = args.splice(2).join(' ');

        //Comprueba si se excedió la longitud máxima del cuerpo (en función de si es un embed o texto plano)
        if ((msg.embeds[0] && newContent.length > 4096) || (!msg.embeds[0] && newContent.length > 2000)) return await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.exceededLength, { length: msg.embeds[0] ? '4096' : '2000' })}.`)
        ]});

        //Comprueba si ha de modificar un embed o un mensaje de texto plano
        if (msg.embeds.length > 0) {

            //Edita el embed con el nuevo contenido
            msg.edit({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(newContent)
            ]});

        } else msg.edit({ content: newContent }); //Edita el embed con el nuevo contenido

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'edit',
    aliases: []
};
