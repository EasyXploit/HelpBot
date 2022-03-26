exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let notToUnwarnEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Los bots no pueden ser advertidos`);
        
        let noWarnIDEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar el ID de la advertencia a quitar`);
        
        let undefinedReasonEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Se debe adjuntar una razón`);
        
        let noWarnsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no tiene advertencias`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [notToUnwarnEmbed] });
        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });
        
        //Esto comprueba si se ha aportado alguna advertencia
        let warnID = args[1];
        if (!warnID && warnID.toLowerCase() !== 'all') return message.channel.send({ embeds: [noWarnIDEmbed] });

        //Almacena la razón
        let reason = args.splice(2).join(' ');

        //Si la razón es indefinida, lo advierte
        if (!reason) return message.channel.send({ embeds: [undefinedReasonEmbed] });

        //Capitaliza la razón
        reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;
          
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);

        //Carga el embed de error de privilegios
        const noPrivilegesEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`);

        
        //Se comprueba si puede des-advertir al miembro
        if (moderator.id !== message.guild.ownerId) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [noPrivilegesEmbed] }).then(msg => {setTimeout(() => msg.delete(), 5000)});
        };

        //Comprueba si el miembro tiene warns
        if (!client.db.warns[member.id]) return message.channel.send({ embeds: [noWarnsEmbed] });

        let successEmbed, loggingEmbed, toDMEmbed;

        //Función para comprobar si el miembro puede borrar cualquier advertencia
        function checkIfCanRemoveAny() {
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let i = 0; i < commandConfig.removeAnyWarn.length; i++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.removeAnyWarn[i])) {
                    authorized = true;
                    break;
                };
            };

            if (authorized) return true;
        };

        if (warnID === 'all') {

            if (!checkIfCanRemoveAny()) return message.channel.send({ embeds: [noPrivilegesEmbed] }).then(msg => {setTimeout(() => msg.delete(), 5000)});

            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} Se han retirado todas las advertencias al miembro **${member.user.tag}**`);

            toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[DES-ADVERTIDO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`<@${member.id}>, se te han retirado todas la advertencias.`)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason, true);

            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [INFRACCIONES]')
                .setDescription('Se han retirado todas las advertencias.')
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            delete client.db.warns[member.id];
        } else {

            if (!client.db.warns[member.id][warnID]) return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} No existe la advertencia con ID **${warnID}**`)
            ] });

            if (!checkIfCanRemoveAny() && client.db.warns[member.id][warnID].moderator !== message.author.id) return message.channel.send({ embeds: [noPrivilegesEmbed] }).then(msg => {setTimeout(() => msg.delete(), 5000)});

            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`Se ha retirado la advertencia con ID **${warnID}** al miembro **${member.user.tag}**`);

            toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[DES-ADVERTIDO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`<@${member.id}>, se te ha retirado la advertencia con ID \`${warnID}\`.`)
                .addField('Moderador', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.db.warns[member.id][warnID].reason, true)
                .addField('Razón', reason, true);

            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [INFRACCIONES]')
                .setDescription('Se ha retirado una advertencia.')
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.db.warns[member.id][warnID].reason, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            //Resta el warn indicado
            delete client.db.warns[member.id][warnID];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.db.warns[member.id]).length === 0) delete client.db.warns[member.id];
        }

        //Escribe el resultado en el JSON
        client.fs.writeFile('./databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {
            if (err) throw err;

            await client.functions.loggingManager('embed', loggingEmbed);
            await member.send({ embeds: [toDMEmbed] });
            await message.channel.send({ embeds: [successEmbed] });
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'rmwarn',
    description: 'Para eliminar una advertencia (o todas) a un miembro.',
    aliases: ['pardon'],
    parameters: '<@miembro| id> <ID de advertencia | "all"> [razón]'
};
