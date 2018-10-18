exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    let disabledEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' Comando `' + command.slice(-0, -3) + '` deshabilitado temporalmente');
    await message.delete()
    await message.channel.send(disabledEmbed).then(msg => {msg.delete(5000)});
    return;
    
    //-giveaway (xS | xM | xH | xD) (nº ganadores) (premio)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es: `' + config.satffPrefix+ 'giveaway "título" (xS | xM | xH | xD) (nº ganadores)`');

        let noTimeEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar una unidad de medida de tiempo. Por ejemplo: `5s`, `10m`, `12h` o `3d`');
        
        let noWinnersEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes proporcionar una cantidad numérica de ganadores superior a 0`);
        
        let noPrizeEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes proporcionar un premio para el sorteo`);
        
        //Comprueba si se han introducido los 3 campos obligatorios
        if (args.length < 3) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba la longitud del tiempo proporcionado
        if (args[0].length < 2) return message.channel.send(noTimeEmbed);

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[0].slice(0, -1);
        let measure = args[0].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send(noTimeEmbed);

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return message.channel.send(noTimeEmbed);

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
        
        let winners = args[1]
        
        //Comprueba si se ha proporcionado un número válido de ganadores.
        if (!winners || winners < 1) return message.channel.send(noWinnersEmbed);
        if (isNaN(winners)) return message.channel.send(noWinnersEmbed);
        
        let winnerType;
        switch (winners) {
            case winners === 1:
                winnerType = 'ganador';
            case winners > 1:
                winnerType = 'ganadores';
        }
        
        //Extrae el premio del sorteo
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let prize = message.content.slice(toDeleteCount);
        if (!prize) return message.channel.send(noPrizeEmbed);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setAuthor(message.author.tag + ' ha iniciado un sorteo', message.author.displayAvatarURL)
            .addField('Iniciado por', '<@' + message.author.id + '>', true)
            .addField('Canal', '<#' + message.channel.id + '>', true)
            .addField('Duración', args[0], true)
            .addField('Ganador/es', winners, true)
            .addField('Premio', prize, true);
        
        let giveawayEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(prize)
            .setDescription(`¡Reacciona con :tada: para entrar!\nTiempo restante: ${Date.now() - time}`)
            .setFooter(`${winners} ${winnerType}`);
        
        await loggingChannel.send(loggingEmbed);
        await message.delete();
        await message.channel.send('🎉 **SORTEO** 🎉');
        
        await message.channel.send(giveawayEmbed).then(async msg => {
            await msg.react('🎉');
            
            bot.giveaways[msg.id] = {
                guild: message.guild.id,
                channel: message.channel.id,
                time: Date.now() + milliseconds,
                winners: winners,
                winnerType: winnerType,
                prize: prize
            }

            fs.writeFile('./giveaways.json', JSON.stringify(bot.giveaways, null, 4), async err => {
                if (err) throw err;
            });
        });
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
