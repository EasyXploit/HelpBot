exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        //Comprueba si se ha proporcionado una cantidad
        if (!args[0]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar la cantidad de mensajes a eliminar`)
        ]});
        
        //Comprueba si se ha especificado una cantidad válida
        if (isNaN(args[0]) || args[0] < 1 || args[0] >= 100) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad numérica igual o superior a 1, e inferior a 100.`)
        ]});

        //Almacena el canal a purgar
        let channel;

        //Busca y almacena el canal a purgar
        if (args[1]) channel = await client.functions.fetchChannel(message.guild, args[1]);
        else channel = message.channel;

        //Almacena un 1 adicional si se ha de purgar el de invocación
        const extraMessages = args[1] && channel.id !== message.channel.id ? 0 : 1;

        //Comprueba si el canal existe
        if (!channel) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} El canal de texto proporcionado no es válido.`)
        ]});

        //Comprueba si el miembro tiene permisos para ejecutar esta acción
        const memberPermissions = channel.permissionsFor(message.author).bitfield;
        if ((memberPermissions & BigInt(0x2000)) !== BigInt(0x2000)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No tienes permiso para administrar mensajes en ${channel}.`)
        ]});

        //Se obtiene la cantidad de mensajes especificada (incluyendo el de invocación)
        const messages = await channel.messages.fetch({limit: parseInt(args[0]) + extraMessages});

        //Si no se encontraron mensajes en el canal, devuelve un error
        if (messages.size <= extraMessages) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No se pudo encontrar ningún mensaje en ${channel}.`)
        ]});

        //Almacena los mensajes que serán borrados
        const msgsToDelete = new client.Collection();

        //Por cada uno de los mensajes obtenidos
        await messages.forEach(msg => {

            //Lo añade al array "msgsToDelete" si tienen una edad menor a 2 semanas 
            if (Date.now() - msg.createdTimestamp  < 1209600000) msgsToDelete.set(msg.id, msg);
        });

        //Si ningún mensaje era lo suficientemente reciente, devuelve un error
        if (msgsToDelete.size <= extraMessages) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Solo se pueden borar mensajes con una antigüedad inferior a \`14 días\`.`)
        ]});

        //Purga los mensajes del canal seleccionado
        await channel.bulkDelete(msgsToDelete);

        //Almacena el mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} Operación completada.`)
            .setDescription(`Mensajes eliminados: \`${msgsToDelete.size - extraMessages}\``);

        //Si se omitieron mensajes, se indica en el footer del embed
        if (msgsToDelete.size < messages.size) successEmbed.setFooter({  text: `Se omitieron ${messages.size - msgsToDelete.size} mensajes.` });

        //Envía un mensaje de confirmación
        await message.channel.send({ embeds: [successEmbed] }).then(msg => {

            //Si el canal de la purga es el mismo que el de invocación, elimina la confirmación a los 3 segundos
            if (channel.id === message.channel.id) setTimeout(() => msg.delete(), 3000)
        }); 

        //Envía un registro al canal de registro
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.logging)
            .setTitle('📑 Registro - [PURGA DE MENSAJES]')
            .setDescription(`${message.author.tag} eliminó ${msgsToDelete.size - extraMessages} mensajes del canal ${channel}.`)
        );

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'purge',
    description: 'Elimina una cierta cantidad de mensajes en un canal (siempre que tenga menos de 14 días de antiguedad).',
    aliases: ['clean'],
    parameters: '<cantidad> [#canal | id]'
};
