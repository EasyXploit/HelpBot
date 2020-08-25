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

            fs.writeFile('./mutes.json', JSON.stringify(bot.mutes, null, 4), async err => {
                if (err) throw err;
            });
        }

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(0xEF494B)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', `<@${member.id}>`, true)
            .addField('Moderador', `<@${moderator.id}`, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', time || '∞', true); //Falta formatear duración

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(0xEF494B)
            .setAuthor('[SILENCIADO]', guild.iconURL())
            .setDescription(`<@${member.id}>, has sido silenciado en ${guild.name}`)
            .addField('Moderador', `<@${moderator.id}>`, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', time || '∞', true); //Falta formatear duración

        await member.roles.add(role);

        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    };

    //Función para expulsar
    async function kick() {


    };

    //Función para banear
    async function ban(time) {

        if (time) {

        };

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

        fs.writeFile(`./warns.json`, JSON.stringify(bot.warns, null, 4), async err => {
            if (err) throw err;

            await loggingChannel.send(loggingEmbed);
        });

        //comprobar que sanción corresponde (si corresponde) en función de automodRules.json
        //tempmute, mute, kick, tempban, ban

        /*
            abrir reglas en orden
            regla *# -> ¿se cumple condición? - actúa o 
        */

        /*const rules = require('./automodRules.json');
        const warnsCount = Object.keys(bot.warns[member.id]).length;

        for (let i = Object.keys(rules).length; i > 0; i--) {
            let rule = rules[i];

            if (warnsCount >= rule.quantity) {
                switch (rule.action) {
                    case tempmute:
                        mute(rule.duration)
                        break;

                    case mute:
                        mute()
                        break;

                    case kick:
                        kick()
                        break;

                    case tempban:
                        ban(rule.duration)
                        break;

                    case ban:
                        ban()
                        break;
                    
                    default:
                        break;
                }
            };
        };*/
    };
};
