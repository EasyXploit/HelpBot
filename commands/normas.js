exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!normas
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setThumbnail('http://i.imgur.com/jAiDAvR.png')
            .setAuthor('NORMAS', 'http://i.imgur.com/jAiDAvR.png')
            .setTitle('Normas del servidor')
            .setDescription('Este servidor se apoya en los **Términos de Servicio** y las **Directivas de la comunidad de Discord**. Puedes encontrarlos en __https://discordapp.com/terms__ y en __https://discordapp.com/guidelines__ respectivamente.')
            .addField(':one: No está permitido publicar contenido inadecuado:', 'Es decir, todo lo relacionado con pornografía, drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil.')
            .addField(':two: Está prohibido hacer spam:', 'No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__')
            .addField(':three: No abuses de las menciones:', 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._')
            .addField(':four: Respeta las temáticas:', 'Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.')
            .addField(':five: No busques vacíos legales:', 'No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
