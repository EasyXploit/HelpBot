exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-tempban (@usuario | id) (xS | xM | xH | xD) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un usuario o escribir su id');

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar un motivo');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes banear a un bot');
        
        let alreadyBannedEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este usuario ya ha sido baneado');
        
        let noCorrectTimeEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar una unidad de medida de tiempo. Por ejemplo: `5s`, `10m`, `12h` o `3d`');
        
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let user = await message.mentions.users.first() || await bot.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);
        
        if (user.bot) return message.channel.send(noBotsEmbed);
        
        let author = message.guild.member(message.author.id)
        
        let member = message.guild.members.get(user.id);
        if (member) {
            //Se comprueba si puede banear al usuario
            if (author.id !== message.guild.owner.id) {
                if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed)
            }
        }
        
        let bans = await message.guild.fetchBans();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send(alreadyBannedEmbed);

        //Comprueba la longitud del tiempo proporcionado
        if (args[1].length < 2) return message.channel.send(noCorrectTimeEmbed);

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[1].slice(0, -1);
        let measure = args[1].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send(noCorrectTimeEmbed);

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return message.channel.send(noCorrectTimeEmbed);

        let milliseconds;

        function stoms(seg) {
            milliseconds = seg * 1000
        }

        function mtoms(min) {
            milliseconds = min * 60000
        }

        function htoms(hour) {
            milliseconds = hour * 3600000
        }

        function dtoms(day) {
            milliseconds = day * 86400000
        } 

        switch (measure) {
            case 's':
                stoms(time);
                break;
            case 'm':
                mtoms(time);
                break;
            case 'h':
                htoms(time);
                break;
            case 'd':
                dtoms(time);
                break;
        }
        
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + user.id + '> ha sido baneado, ¿alguien más? ' + resources.drakeban);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(user.tag + ' ha sido BANEADO', user.displayAvatarURL)
            .addField('Miembro', '<@' + user.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[BANEADO]', message.guild.iconURL)
            .setDescription('<@' + user.id + '>, has sido baneado en ' + message.guild.name)
            .addField('Moderador', '@' + message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);
        
        bot.bans[user.id] = {
            guild: message.guild.id,
            time: Date.now() + milliseconds
        }

        fs.writeFile('./bans.json', JSON.stringify(bot.bans, null, 4), async err => {
            if (err) throw err;

            if (member) {
                await user.send(toDMEmbed);
            }
            await message.guild.ban(user, {reason: reason});
            await loggingChannel.send(loggingEmbed);
            await message.channel.send(successEmbed);
        });
    } catch (e) {
        if (e.toString().includes('Invalid Form Body')) {
            let notToBanEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' Si el usuario no está en el servidor, has de especificar su ID');
            message.channel.send(notToBanEmbed);
            console.log(e);
        } else {
            const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
        }
    }
}
