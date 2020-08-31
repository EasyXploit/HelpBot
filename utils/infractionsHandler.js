exports.run = async (discord, fs, config, bot, resources, loggingChannel, message, guild, member, reason, action, moderator, msg) => {

    //Función para silenciar
    async function mute(time) {

        //Comprueba si existe el rol silenciado, y de no existir, lo crea
        let role = guild.roles.cache.find(r => r.name === 'Silenciado');
        if (!role) {
            role = await guild.roles.create({
                name: 'Silenciado',
                color: '#818386',
                permissions: []
            });
            
            let botMember = guild.members.cache.get(bot.user.id);
            await role.setPosition(botMember.roles.highest.position - 1);
            
            guild.channels.forEach(async (channel) => {
                await channel.createOverwrite (role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false
                });
            });
        }

        //Comprueba si este usuario ya estaba silenciado
        if (member.roles.cache.has(role.id)) return;

        if (time) {

            bot.mutes[member.id] = {
                time: Date.now() + time
            }

            fs.writeFile('./storage/mutes.json', JSON.stringify(bot.mutes, null, 4), async err => {
                if (err) throw err;
            });
        }

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(0xEF494B)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', `<@${member.id}>`, true)
            .addField('Moderador', `<@${moderator.id}>`, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', new Date(parseInt(time)).toLocaleString() || '∞', true);

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(0xEF494B)
            .setAuthor('[SILENCIADO]', guild.iconURL())
            .setDescription(`<@${member.id}>, has sido silenciado en ${guild.name}`)
            .addField('Moderador', `<@${moderator.id}>`, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', new Date(parseInt(time)).toLocaleString() || '∞', true);

        await member.roles.add(role);

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    };

    //Función para expulsar
    async function kick() {
        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setAuthor(`${member.user.tag} ha sido EXPULSADO`, member.user.displayAvatarURL())
            .addField('Miembro', `<@${member.id}>`, true)
            .addField('Moderador', `<@${moderator.id}>`, true)
            .addField('Razón', 'Demasiadas advertencias', true);

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setAuthor(`[EXPULSADO]`, guild.iconURL())
            .setDescription(`<@${member.id}>, has sido expulsado en ${guild.name}`)
            .addField(`Moderador`, `<@${moderator.id}>`, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);

        await member.kick(reason);
    };

    //Función para banear
    async function ban(time) {

        if (time) {
            bot.bans[user.id] = {
                time: Date.now() + time
            }
    
            fs.writeFile(`./storage/bans.json`, JSON.stringify(bot.bans, null, 4), async err => {
                if (err) throw err;
            });
        };

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`${member.tag} ha sido BANEADO`, user.displayAvatarURL())
            .addField(`Miembro`, `<@${member.id}>`, true)
            .addField(`ID`, `${member.id}`, true)
            .addField(`Moderador`, `<@${moderator.id}>`, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setAuthor(`[BANEADO]`, message.guild.iconURL())
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, `<@${moderator.id}>`, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);

        await guild.members.ban(user, {reason: `Moderador: ${moderator.id}, Razón: Demasiadas advertencias`});

    };

    //Envía un mensaje de advertencia
    let publicWarnEmbed = new discord.MessageEmbed()
        .setColor(resources.orange)
        .setDescription(`${resources.OrangeTick} El usuario <@${member.id}> ha sido advertido debido a **${reason}**`);

    let toDMEmbed = new discord.MessageEmbed()
        .setColor(resources.orange)
        .setAuthor(`[ADVERTIDO]`, guild.iconURL())
        .setDescription(`<@${member.id}>, has sido advertido en ${guild.name}`)
        .addField(`Moderador`, `<@${moderator.id}>`, true)
        .addField(`Razón`, reason, true);

    await message.channel.send(publicWarnEmbed).then(msg => {msg.delete({timeout: 5000})});
    await member.send(toDMEmbed);

    //LEYENDA DE ACCIONES: 1 = borrar; 2 = advertir; 3 = borrar y advertir
    if (action === 1 || action === 3) { //Borra el mensaje si se ha de hacer
        if (message.deletable) message.delete();
    }

    if (action === 2 || action === 3) { //Advierte si se ha de hacer

        //Añade una nueva infracción para el usuario
        if (!bot.warns[member.id]) bot.warns[member.id] = {};
        
        bot.warns[member.id][Date.now()] = {
            reason: reason,
            moderator: moderator.id
        };

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.orange)
            .setAuthor(`${member.user.tag} ha sido SANCIONADO`, member.user.displayAvatarURL())
            .addField(`Miembro`, `<@${member.id}>`, true)
            .addField(`Moderador`, `<@${moderator.id}>`, true)
            .addField(`Razón`, reason, true)
            .addField(`Canal`, `<#${message.channel.id}>`, true)
            .addField('Infracciones', Object.keys(bot.warns[member.id]).length, true);
        
        if (msg) loggingEmbed.addField(`Mensaje`, msg, true);

        fs.writeFile(`./storage/warns.json`, JSON.stringify(bot.warns, null, 4), async err => {
            if (err) throw err;

            await loggingChannel.send(loggingEmbed);
        });

        const rules = require('./automod/automodRules.json');

        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            let warnsCount = 0;

            Object.keys(bot.warns[member.id]).forEach(entry => {
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
