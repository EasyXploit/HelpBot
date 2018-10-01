exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!tatsumaki
    
    try {
        let helpEmbed1 = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle('Tatsumaki, el bot social :fire:')
            .setDescription('__**Básicos:**__  :paperclip:\n• `@Tatsumaki [mensaje]` _comienza a hablar con el bot (en inglés)_\n• `t!avatar [usuario]` _muestra su foto de perfil_\n• `t!usage [comando]` _te explica como usar un comando (en inglés)_\n\n__**Social:**__  :speech_balloon:\n• `t!profile [@usuario]` _enseña su perfil_\n• `t!profile [@rank]` _muestra su rango_\n• `t!top [global | server] [página]`   _envía el top usuarios con más XP_\n• `t!dailies [@usuario]` _te otorga créditos diarios_\n• `t!reputation [@usuario]` _le suma 1 de reputación a un usuario_\n• `t!phonebook` _permite chatear entre servidores_\n• `t!credits [usuario] [cantidad]` _consulta tu crédito o envía a otros usuarios_\n\n• `t!setinfo [texto]` _cambia la biografía de tu perfil_\n• `t!settitle [texto]` _cambia el título de tu perfil_\n• `t!background` _muestra un enlace para cambiar el fondo de tu perfil_\n• `t!badges` _abre el menú de medallas_\n\n__**Entretenimiento:**__  :black_joker:\n• `t!image <subreddit>` _obtiene una imagen aleatoria de Imgur_\n• `t!dice [d(lados)]` _tira un dado con 6 lados o según lo especificado_\n• `t!choose [option1] [option2] [ ... ]` _elige por ti_\n• `t!8ball [pregunta]` _pregunta a la bola mágica_\n• `t!coin` _lanza una moneda_\n• `t!rps [rock | paper | scissors ]` _juega a "piedra, papel o tijeras"_\n• `t!numberfacts [número]` _obtiener datos sobre los números_\n• `t!catfacts` _obtiene datos sobre gatos_\n• `t!fortune [categoría]` _obtiene datos sobre una categoría_\n• `t!cat` _te da un gato al azar_\n• `t!cookie <@usuario>` _da una galleta a un usuariol_\n• `t!psychopass <@usuario>` _el sistema Sibyl dirá el coeficiente criminal._\n• `t!reverse <texto>` _le da la vuelta al texto_\n\n**1/2**')
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL);

        let helpEmbed2 = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setDescription('**2/2:**\n\n__**Utilidades:**__  :triangular_ruler:\n• `t!youtube <texto>` _busca un vídeo en YouTube_\n• `t!vote <start | check | end>` _comience, vote o verifica una votación_\n• `t!urban <texto>` _busca en el diccionario urbano_\n• `t!strawpoll <opción1> <opción2> < ... >` _crea un Strawpoll_\n• `t!wiki <texto>` _busca artículos de Wikipedia_\n• `t!weather <ciudad/código postal>`   _obtiene el clima_\n• `t!shorten <URL>` _acorta un enlace_\n• `t!todo [ add | remove | clear | list ]`   _lista de tareas personales_\n\n__**Anime/memes:**__  :anger:\n• `t!anime <texto>` _obtiene detalles de un anime de MAL_\n• `t!manga <texto>` _obtiene detalles de un manga de MAL_\n• `t!schoolidol <texto>`   _obtiene las tarjetas LLSIF_\n• `t!osu` _busca en osu! perfiles, juegos y firmas_\n• `t!beautiful [alguien]` _dice que algo es bonito_')
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL);
        
        await message.channel.send(helpEmbed1);
        await message.channel.send(helpEmbed2);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
