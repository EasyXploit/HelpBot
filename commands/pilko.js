exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setThumbnail(`https://i.imgur.com/cTW63kf.png`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setDescription(`Comandos de ${client.user.username}`)
            .addField(`${resources.fortnite} ${config.prefix}fortnite "usuario" "solo/duo/squad/lifetime" "pc/xbl/psn"`, `Obtiene estadísticas de Fortnite Battle Royale.`)
            .addField(`🎶 ${config.prefix}musica`, `Muestra la ayuda para reproducir música en los canales de voz.`)
            .addField(`🎙 ${config.prefix}sound (término)`, `Busca y reproduce una grabación (Usa ` + ' `' + config.prefix + 'sound list` ' + ` para ver la lista de grabaciones disponibles).`)
            .addField(`${resources.translate} ${config.prefix}translate (idioma orígen) (idioma destino) (texto a traducir)`, `Traduce un texto proporcionado por el usuario (usa códigos de idioma. P. ej: _en_)`)
            .addField(`👦 ${config.prefix}avatar (@usuario)`,  `Muestra tu avatar o el de cualquier usuario.`)
            .addField(`🌦 ${config.prefix}weather (ubicación)`,  `Obtiene información metereológica acerca de la ubicación proporcionada.`)
            .addField(`🐈 ${config.prefix}catfacts`, `Muestra un dato curioso aleatorio sobre los gatos.`)
            .addField(`🐕 ${config.prefix}dogfacts`, `Muestra un dato curioso aleatorio sobre los perros.`)
            .addField(`🎲 ${config.prefix}dado`, `Lanzará un dado.`)
            .addField(`${resources.coin} ${config.prefix}moneda`, `Lanzará una moneda.`)
            .addField(`🎱 ${config.prefix}8ball (pregunta)`, `La bola mágica te dará una respuesta.`)
            .addField(`✂ ${config.prefix}ppt (piedra | papel | tijeras)`, `Juega a Piedra, Papel y Tijeras con ${client.user.username}.`)
            .addField(`🦎 ${config.prefix}pptls (piedra | papel | tijeras | lagarto | spock)`, `Juega a Piedra, Papel, Tijeras, Lagarto y Spock con ${client.user.username}.`)
            .addField(`📔 ${config.prefix}urban (término)`, `Busca en el Urban Dictionary (en inglés)`)
            .addField(`🎯 ${config.prefix}elige "opción1" "opción2" ...`, `${client.user.username} elegirá por ti de entre las opciones que le facilites.`)
            .addField(`📝 ${config.prefix}reves (texto)`, `${client.user.username} le dará la vuelta al texto que especifiques.`)
            .addField(`💭 ${config.prefix}di (texto)`, `Hará que ${client.user.username} repita lo que escribas.`)
            .addField(`🔫 ${config.prefix}psychopass (@usuario | nada)`, `Hará que el sistema Sibyl diga el coeficiente criminal del sujeto.`)
            .addField(`🔢 ${config.prefix}calcula (número 1) (+ | - | * | / | round | pow | sqrt | abs | ceil | floor | sin | cos) (número 2 si procede)`, `Resolverá la operación matemática expresada`)
            .addField(`🔮 ${config.prefix}paulo`, `Comando que envía frases aleatorias de Paulo Coelho`)
            .addField(`⏱ ${config.prefix}ping`, `Comprueba el tiempo de respuesta entre el cliente y ${client.user.username}`)
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
