exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Comprueba si se han proporcionado los cargumentos correctamente
        if (!args[0] || !args[1] || (args[0] !== 'embed' && args[0] !== 'normal')) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena el cuerpo del mensaje
        let body = args.slice(1).join(' ');

        //Comprueba si ha de enviar un embed o un mensaje normal
        if (args[0] === 'embed') {

            //Envía un embed con el mensaje
            message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(body)]
            });

        } else if (args[0] === 'normal') {

            //Envía el mensaje en texto plano
            message.channel.send({ content: body });
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
