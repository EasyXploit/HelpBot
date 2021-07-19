exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!comandos
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setThumbnail(`https://i.imgur.com/cTW63kf.png`)
            .setAuthor(client.user.username, client.user.avatarURL())
            .setDescription(`Comandos de ${client.user.username}`)
            .addField(`🎶 ${client.config.prefixes.mainPrefix}musica`, `Muestra la ayuda para reproducir música en los canales de voz.`)
            .addField(`🎙 ${client.config.prefixes.mainPrefix}sound (término)`, `Busca y reproduce una grabación (Usa ` + ' `' + client.config.prefixes.mainPrefix + 'sound list` ' + ` para ver la lista de grabaciones disponibles).`)
            .addField(`🌐 ${client.config.prefixes.mainPrefix}translate (idioma orígen) (idioma destino) (texto a traducir)`, `Traduce un texto proporcionado (usa códigos de idioma. P. ej: _en_)`)
            .addField(`👦 ${client.config.prefixes.mainPrefix}avatar (@usuario)`,  `Muestra tu avatar o el de cualquier miembro.`)
            .addField(`🌦 ${client.config.prefixes.mainPrefix}weather (ubicación)`,  `Obtiene información metereológica acerca de la ubicación proporcionada.`)
            .addField(`🎭 ${client.config.prefixes.mainPrefix}meme`, `Muestra un meme aleatorio en Español.`)
            .addField(`💟 ${client.config.prefixes.mainPrefix}love (@usuario | nada)`, `Inicia un test de afinidad amorosa con alguien.`)
            .addField(`🎲 ${client.config.prefixes.mainPrefix}dado`, `Lanzará un dado.`)
            .addField(`🪙 ${client.config.prefixes.mainPrefix}moneda`, `Lanzará una moneda.`)
            .addField(`🎱 ${client.config.prefixes.mainPrefix}8ball (pregunta)`, `La bola mágica te dará una respuesta.`)
            .addField(`✂ ${client.config.prefixes.mainPrefix}ppt (piedra | papel | tijeras)`, `Juega a Piedra, Papel y Tijeras con ${client.user.username}.`)
            .addField(`🦎 ${client.config.prefixes.mainPrefix}pptls (piedra | papel | tijeras | lagarto | spock)`, `Juega a Piedra, Papel, Tijeras, Lagarto y Spock con ${client.user.username}.`)
            .addField(`📔 ${client.config.prefixes.mainPrefix}urban (término)`, `Busca en el Urban Dictionary (en inglés)`)
            .addField(`🎯 ${client.config.prefixes.mainPrefix}elige "opción1" "opción2" ...`, `${client.user.username} elegirá por ti de entre las opciones que le facilites.`)
            .addField(`📝 ${client.config.prefixes.mainPrefix}reves (texto)`, `${client.user.username} le dará la vuelta al texto que especifiques.`)
            .addField(`💭 ${client.config.prefixes.mainPrefix}di (texto)`, `Hará que ${client.user.username} repita lo que escribas.`)
            .addField(`🔫 ${client.config.prefixes.mainPrefix}psychopass (@usuario | nada)`, `Hará que el sistema Sibyl diga el coeficiente criminal del sujeto.`)
            .addField(`🔢 ${client.config.prefixes.mainPrefix}calcula (número 1) (+ | - | * | / | round | pow | sqrt | abs | ceil | floor | sin | cos) (número 2 si procede)`, `Resolverá la operación matemática expresada`)
            .addField(`🔮 ${client.config.prefixes.mainPrefix}paulo`, `Comando que envía frases aleatorias de Paulo Coelho`)
            .addField(`⏱ ${client.config.prefixes.mainPrefix}ping`, `Comprueba el tiempo de respuesta entre el cliente y ${client.user.username}`);
        message.channel.send(helpEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
