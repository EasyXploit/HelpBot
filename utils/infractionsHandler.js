exports.run = async (discord, fs, config, client, resources, loggingChannel, message, guild, member, reason, action, moderator, msg) => {

    //Función para silenciar
    async function mute(time) {

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await resources.checkMutedRole(message.guild);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return;
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        resources.spreadMutedRole(message.guild);

        if (time) {
            client.mutes[member.id] = {
                time: Date.now() + time
            };

            fs.writeFile('./storage/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
                if (err) throw err;
            });
        };

        let durartion = Math.floor(time/(24000*1000*60*60)) + "d " + Math.floor(time/(1000*60*60)) + ":" + Math.floor(time/(1000*60))%60 + ":" + Math.floor(time/1000)%60 || '∞';

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', durartion, true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setAuthor('[SILENCIADO]', guild.iconURL())
            .setDescription(`${member.user.tag}, has sido silenciado en ${guild.name}`)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', durartion, true);

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    };

    //Función para expulsar
    async function kick() {
        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`${member.user.tag} ha sido EXPULSADO`, member.user.displayAvatarURL())
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`[EXPULSADO]`, guild.iconURL())
            .setDescription(`<@${member.id}>, has sido expulsado en ${guild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);

        await member.kick(reason);
    };

    //Función para banear
    async function ban(time) {

        if (time) {
            client.bans[user.id] = {
                time: Date.now() + time
            }
    
            fs.writeFile(`./storage/bans.json`, JSON.stringify(client.bans, null, 4), async err => {
                if (err) throw err;
            });
        };

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`${member.user.tag} ha sido BANEADO`, user.displayAvatarURL())
            .addField(`Miembro`, member.user.tag, true)
            .addField(`ID`, member.id, true)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`[BANEADO]`, message.guild.iconURL())
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);

        await guild.members.ban(user, {reason: `Moderador: ${moderator.id}, Razón: Demasiadas advertencias`});

    };

    //Envía un mensaje de advertencia
    let publicWarnEmbed = new discord.MessageEmbed()
        .setColor(resources.orange)
        .setDescription(`${resources.OrangeTick} El miembro **${member.user.tag}** ha sido advertido debido a **${reason}**`);

    let toDMEmbed = new discord.MessageEmbed()
        .setColor(resources.orange)
        .setAuthor(`[ADVERTIDO]`, guild.iconURL())
        .setDescription(`<@${member.id}>, has sido advertido en ${guild.name}`)
        .addField(`Moderador`, moderator.tag, true)
        .addField(`Razón`, reason, true);

    await message.channel.send(publicWarnEmbed).then(msg => {msg.delete({timeout: 5000})});
    await member.send(toDMEmbed);

    //LEYENDA DE ACCIONES: 1 = borrar; 2 = advertir; 3 = borrar y advertir
    if (action === 1 || action === 3) { //Borra el mensaje si se ha de hacer
        if (message.deletable) message.delete();
    }

    if (action === 2 || action === 3) { //Advierte si se ha de hacer

        //Añade una nueva infracción para el miembro
        if (!client.warns[member.id]) client.warns[member.id] = {};
        
        client.warns[member.id][Date.now()] = {
            reason: reason,
            moderator: moderator.id
        };

        fs.writeFile(`./storage/warns.json`, JSON.stringify(client.warns, null, 4), async err => {
            if (err) throw err;

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setAuthor(`${member.user.tag} ha sido ADVERTIDO`, member.user.displayAvatarURL())
                .addField(`Miembro`, member.user.tag, true)
                .addField(`Moderador`, moderator.tag, true)
                .addField(`Razón`, reason, true)
                .addField(`Canal`, `<#${message.channel.id}>`, true)
                .addField('Infracciones', Object.keys(client.warns[member.id]).length, true);

            await loggingChannel.send(loggingEmbed);

            //Si procede, adjunta el mensaje filtrado
            if (msg) loggingChannel.send(new discord.MessageAttachment(Buffer.from(`CONTENIDO DEL MENSAJE: \n${msg}`, 'utf-8'), `mensaje-filtrado-${Date.now()}.txt`))
        });

        const rules = require('./automod/automodRules.json');

        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            let warnsCount = 0;

            Object.keys(client.warns[member.id]).forEach(entry => {
                if (Date.now() - entry <= rule.age) warnsCount++
            });

            if (warnsCount >= rule.quantity) {
                switch (rule.action) {
                    case 'tempmute': mute(rule.duration); break;
                    case 'mute': mute(); break;
                    case 'kick': kick(); break;
                    case 'tempban': ban(rule.duration); break;
                    case 'ban': ban(); break;
                };
                break;
            };
        };
    };
};
