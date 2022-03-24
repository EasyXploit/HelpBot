exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
    
        //Comprueba si los parámetros se han proporcionado correctamente
        if (!args[0] || !args[1] || !args[2]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es:\n\`${client.config.main.prefix}${command}${commandConfig.export.parameters.length > 0 ? ' ' + commandConfig.export.parameters : ''}\`.`)
        ]});
            
        //Busca el canal en la guild
        const channel = await client.functions.fetchChannel(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado el canal
        if (!channel) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El canal ${!isNaN(args[0] ? `con ID ${args[0]} ` : args[0])} no existe.`)
        ]});
        
        //Busca el mensaje en el canal
        const msg = await client.functions.fetchMessage(channel, args[1])
        if (!msg) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El mensaje con ID \`${args[1]}\` no existe.`)
        ]});

        //Comprueba si el mensaje es del bot
        if (msg.author.id !== client.user.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedo editar un mensaje que no he enviado.`)
        ]});

        //Almacena el nuevo cuerpo del mensaje
        const newContent = args.splice(2).join(' ');

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
    description: 'Edita un mensaje enviado previamente por el bot.',
    aliases: [],
    parameters: '<#canal | id> <ID del mensaje> <nuevo contenido>'
};
