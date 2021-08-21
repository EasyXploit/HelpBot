exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!rmwarn (@miembro | id) (id de advertencia | all) (razón)
    
    try {
        let notToUnwarnEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Los bots no pueden ser advertidos`);
        
        let noWarnIDEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar el ID de la advertencia a quitar`);
        
        let undefinedReasonEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Se debe adjuntar una razón`);
        
        let noWarnsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Este miembro no tiene advertencias`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToUnwarnEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha aportado alguna advertencia
        let warnID = args[1];
        if (!warnID && warnID.toLowerCase() !== 'all') return message.channel.send(noWarnIDEmbed);
        
        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(2).join(" ") || 'Indefinida';
        if (reason === 'Indefinida' && message.author.id !== message.guild.ownerID) return message.channel.send(undefinedReasonEmbed);
          
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);

        //Carga el embed de error de privilegios
        const noPrivilegesEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`);

        
        //Se comprueba si puede des-advertir al miembro
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});
        };

        //Comprueba si el miembro tiene warns
        if (!client.warns[member.id]) return message.channel.send(noWarnsEmbed);

        let successEmbed, loggingEmbed, toDMEmbed;

        //Función para comprobar si el miembro puede borrar cualquier advertencia
        function checkIfCanRemoveAny() {
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let i = 0; i < commandConfig.rolesThatCanRemoveAnyWarn.length; i++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerID || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.rolesThatCanRemoveAnyWarn[i])) {
                    authorized = true;
                    break;
                };
            };

            if (authorized) return true;
        };

        if (warnID === 'all') {

            if (!checkIfCanRemoveAny()) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});

            successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setDescription(`${client.customEmojis.greenTick} Se han retirado todas las advertencias al miembro **${member.user.tag}**`);

            toDMEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green)
                .setAuthor('[DES-ADVERTIDO]', message.guild.iconURL({ dynamic: true}))
                .setDescription(`<@${member.id}>, se te han retirado todas la advertencias.`)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason, true);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [INFRACCIONES]')
                .setDescription('Se han retirado todas las advertencias.')
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Moderador:', message.author.tag, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            delete client.warns[member.id];
        } else {
            if (!checkIfCanRemoveAny() && client.warns[member.id][warnID].moderator !== message.author.id) return message.channel.send(noPrivilegesEmbed).then(msg => {msg.delete({timeout: 5000})});

            successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setDescription(`${client.customEmojis.greenTick} Se ha retirado la advertencia con ID **${warnID}** al miembro **${member.user.tag}**`);

            toDMEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green)
                .setAuthor('[DES-ADVERTIDO]', message.guild.iconURL({ dynamic: true}))
                .setDescription(`<@${member.id}>, se te ha retirado la advertencia con ID \`${warnID}\``)
                .addField('Moderador', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.warns[member.id][warnID].reason, true)
                .addField('Razón', reason, true);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setTitle('📑 Auditoría - [INFRACCIONES]')
                .setDescription('Se ha retirado una advertencia.')
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Moderador:', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.warns[member.id][warnID].reason, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            //Resta el warn indicado
            delete client.warns[member.id][warnID];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.warns[member.id]).length === 0) delete client.warns[member.id];
        }

        //Escribe el resultado en el JSON
        client.fs.writeFile('./databases/warns.json', JSON.stringify(client.warns, null, 4), async err => {
            if (err) throw err;

            await client.functions.loggingManager(loggingEmbed);
            await member.send(toDMEmbed);
            await message.channel.send(successEmbed);
        });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'rmwarn',
    aliases: ['pardon']
};
