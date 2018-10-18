exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    try {
        let helpEmbed = new discord.RichEmbed()
            .setColor(resources.gold)
            .setThumbnail(`https://i.imgur.com/cTW63kf.png`)
            .setAuthor(bot.user.username, bot.user.avatarURL)
            .setDescription(`Comandos de ${bot.user.username}`)
            .addField(`${resources.fortnite} ${config.prefix}fortnite "usuario" "solo/duo/squad/lifetime" "pc/xbl/psn"`, `Muestra estadísticas de Fortnite Battle Royale.`, true)
            .addField(`🎶 ${config.prefix}play (URL | término)`, `Busca y reproduce una canción de YouTube. ${resources.beta}`, true)
            .addField(`🎙 ${config.prefix}sound (término)`, `Busca y reproduce una grabación (Usa ` + ' `' + config.prefix + 'sound list` ' + ` para ver la lista de grabaciones disponibles).`, true)
            .addField(`👦 ${config.prefix}avatar (@usuario)`,  `Muestra tu avatar o el de cualquier usuario.`, true)
            .addField(`🐈 ${config.prefix}catfacts`, `Muestra un dato curioso sobre los gatos.`, true)
            .addField(`🐕 ${config.prefix}dogfacts`, `Muestra un dato curioso sobre los perros.`, true)
            .addField(`🎲 ${config.prefix}dado`, `Lanzará un dado.`, true)
            .addField(`${resources.coin} ${config.prefix}moneda`, `Lanzará una moneda.`, true)
            .addField(`🎱 ${config.prefix}8ball (pregunta)`, `La bola mágica te dará una respuesta.`, true)
            .addField(`✂ ${config.prefix}ppt (piedra | papel | tijeras)`, `Juega a Piedra, Papel y Tijeras con ${bot.user.username}.`, true)
            .addField(`🦎 ${config.prefix}pptls (piedra | papel | tijeras | lagarto | spock)`, `Juega a Piedra, Papel, Tijeras, Lagarto y Spock con ${bot.user.username}.`, true)
            .addField(`📔 ${config.prefix}urban (término)`, `Busca en el Urban Dictionary (en inglés)`, true)
            .addField(`🎯 ${config.prefix}elige "opción1" "opción2" ...`, `${bot.user.username} elegirá por ti de entre las opciones que le facilites.`, true)
            .addField(`📝 ${config.prefix}reves (texto)`, `${bot.user.username} le dará la vuelta al texto que especifiques.`, true)
            .addField(`💭 ${config.prefix}di (texto)`, `Hará que ${bot.user.username} repita lo que escribas.`, true)
            .addField(`🔫 ${config.prefix}psychopass (@usuario | nada)`, `Hará que el sistema Sibyl diga el coeficiente criminal del sujeto.`, true)
            .addField(`🔢 ${config.prefix}calcula (número 1) (+ | - | * | / | round | pow | sqrt | abs | ceil | floor | sin | cos) (número 2 si procede)`, `Resolverá la operación matemática expresada`, true)
            .addField(`🔮 ${config.prefix}paulo`, `Comando que envía frases aleatorias de Paulo Coelho`, true)
            .addField(`⏱ ${config.prefix}ping`, `Comprueba el tiempo de respuesta entre el cliente y ${bot.user.username}`, true)
            .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
