exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-warn (@miembro | id) (razón)
    
    try {
        let notToMuteEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes advertir a un bot');
        
        let undefinedReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Se debe adjuntar una razón');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(1).join(" ");
        if (!reason) return message.channel.send(undefinedReasonEmbed);
          
        let moderator = message.guild.member(message.author.id);
        
        //Se comprueba si puede advertir al usuario
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        message.delete();

        let successEmbed = new discord.RichEmbed()
            .setColor(0xF8A41E)
            .setDescription(`${resources.OrangeTick} El usuario <@${member.id}> ha sido advertido debido a **${reason}**`);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xF8A41E)
            .setAuthor(member.user.tag + ' ha sido ADVERTIDO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + moderator.id + '>', true)
            .addField('Razón', reason, true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xF8A41E)
            .setAuthor('[ADVERTIDO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido advertido en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        if (!bot.warns[member.id]) bot.warns[member.id] = {
            guild: message.guild.id,
            warns: 0
        }
        
        bot.warns[member.id].warns++;

        fs.writeFile('./warns.json', JSON.stringify(bot.warns, null, 4), async err => {
            if (err) throw err;

            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
            await member.send(toDMEmbed);
        });
        
        
        //MODERACIÓN AUTOMÁTICA
        
        async function mute(duration) {
            //Comprueba si existe el rol silenciado, y de no existir, lo crea
            let role = message.guild.roles.find(r => r.name === 'Silenciado');
            if (!role) {
                role = await message.guild.createRole({
                    name: 'Silenciado',
                    color: '#818386',
                    permissions: []
                });
                
                let botMember = message.guild.members.get(bot.user.id);
                await message.guild.setRolePosition(role, botMember.highestRole.position - 1);

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions (role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SPEAK: false
                    });
                });
            }

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0xEF494B)
                .setAuthor(member.user.tag + ' ha sido SILENCIADO', member.user.displayAvatarURL)
                .addField('Miembro', '<@' + member.id + '>', true)
                .addField('Moderador', '<@' + bot.user.id + '>', true)
                .addField('Razón', 'Demasiadas advertencias', true)
                .addField('Duración', duration, true);

            let toDMEmbed = new discord.RichEmbed()
                .setColor(0xEF494B)
                .setAuthor('[SILENCIADO]', message.guild.iconURL)
                .setDescription('<@' + member.id + '>, has sido silenciado en ' + message.guild.name)
                .addField('Moderador', '<@' + bot.user.id + '>', true)
                .addField('Razón', 'Demasiadas advertencias', true)
                .addField('Duración', duration, true);

            //Comprueba si este susuario ya estaba silenciado
            if (!member.roles.has(role.id)) {
                await member.addRole(role);
            }
            
            await loggingChannel.send(loggingEmbed);
            await member.send(toDMEmbed);
        }

        //Según las reglas aplicadas, se aplica una amonestación diferente para cada caso
        if (bot.warns[member.id].warns >= 3 && bot.warns[member.id].warns < 5  && !bot.mutes.hasOwnProperty(member.id)) {
        
            mute('12h');

            bot.mutes[member.id] = {
                guild: message.guild.id,
                time: Date.now() + 43200000
            }

            fs.writeFile('./mutes.json', JSON.stringify(bot.mutes, null, 4), async err => {
                if (err) throw err;
            })
            
        } else if (bot.warns[member.id].warns >= 5) {
            if (bot.mutes.hasOwnProperty(member.id)) {
                await delete bot.mutes[member.id];
                await fs.writeFile('./mutes.json', JSON.stringify(bot.mutes), async err => {
                    if (err) throw err;
                });
            };
            mute('∞');
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
