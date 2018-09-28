exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    try {
        let helpEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setThumbnail('https://i.imgur.com/cTW63kf.png')
            .setAuthor(bot.user.username, bot.user.avatarURL)
            .setDescription('Comandos de ' + bot.user.username)
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL)
            .addField(emojis.fortnite + ' ' + config.prefix + 'fortnite "usuario" "solo/duo/squad/lifetime" "pc/xbl/psn"', 'Muestra estadísticas de Fortnite Battle Royale.', true)
            .addField('👦 ' + config.prefix + 'avatar <@usuario>',  'Muestra tu avatar o el de cualquier usuario.', true)
            .addField('🐈 ' + config.prefix + 'catfacts', 'Muestra un dato curioso sobre los gatos.', true)
            .addField('🐕 ' + config.prefix + 'dogfacts', 'Muestra un dato curioso sobre los perros.', true)
            .addField(':game_die: ' + config.prefix + 'dado', 'Lanzará un dado.', true)
            .addField(emojis.coin + ' ' + config.prefix + 'moneda', 'Lanzará una moneda.', true)
            .addField(':8ball: ' + config.prefix + '8ball <pregunta>', 'La bola mágica te dará una respuesta.', true)
            .addField('✂ ' + config.prefix + 'ppt <piedra | papel | tijeras>', 'Juega a Piedra, Papel y Tijeras con ' + bot.user.username + '.', true)
            .addField('🦎 ' + config.prefix + 'pptls <piedra | papel | tijeras | lagarto | spock>', 'Juega a Piedra, Papel, Tijeras, Lagarto y Spock con ' + bot.user.username + '.', true)
            .addField('🎯 ' + config.prefix + 'elige "opción1" "opción2" ...', bot.user.username + ' elegirá por ti de entre las opciones que le facilites.', true)
            .addField('📝 ' + config.prefix + 'reves <texto>', bot.user.username + ' le dará la vuelta al texto que especifiques.', true)
            .addField('💭 ' + config.prefix + 'di <texto>', 'Hará que ' + bot.user.username + ' repita lo que escribas.', true);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
