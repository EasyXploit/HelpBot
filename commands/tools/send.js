exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Comprueba si se han proporcionado los argumentos correctamente
        if (!args[0] || !args[1] || (args[0] !== 'embed' && args[0] !== 'normal')) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena el cuerpo del mensaje
        const body = args.slice(1).join(' ');

        //Comprueba si ha de enviar un embed o un mensaje normal
        if (args[0] === 'embed') {

            //Comprueba si se excedió la longitud máxima
            if (body.length > 4096) return await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} La longitud máxima es de \`4096\` carácteres.`)
            ]});

            //Envía un embed con el mensaje
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(body)]
            });

        } else if (args[0] === 'normal') {

            //Comprueba si se excedió la longitud máxima
            if (body.length > 2000) return await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} La longitud máxima es de \`2000\` carácteres.`)
            ]});

            //Envía el mensaje en texto plano
            await message.channel.send({ content: body });
        };

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'send',
    description: 'El bot enviará un mensaje al canal de texto actual, con o sin formato incrustado.',
    aliases: [],
    parameters: '<"embed" | "normal"> <mensaje>'
};
