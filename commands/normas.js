exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!normas
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setThumbnail('http://i.imgur.com/jAiDAvR.png')
            .setAuthor('NORMAS', 'http://i.imgur.com/jAiDAvR.png')
            .setTitle('Normas del servidor')
            .setDescription('Este servidor se apoya en los [**Términos de Servicio**](https://discordapp.com/terms) y las [**Directivas de la comunidad de Discord**](https://discordapp.com/guidelines). Participar en la comunidad supone la aceptación de las normas expuestas en este documento.')
            .addField(':one: No está permitido publicar contenido inadecuado:', 'Es decir, todo lo relacionado con pornografía, drogas y apuestas. Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil o estafas.')
            .addField(':two: Está prohibido hacer spam:', 'No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado (incluyendo mensajes directos). Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__')
            .addField(':three: No abuses de las menciones:', 'No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._')
            .addField(':four: Respeta las temáticas:', 'Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.')
            .addField(':five: Uso adecuado de cuentas:', 'Así cómo no está permitido publicar contenido inadecuado, la misma norma aplica para los nombres de usuario. No está permitido emplear nombres de usuario de Discord o apodos inadecuados, cómo palabras ofensivas, enlaces o carácteres ilegibles por sistemas automatizados. Por otro lado, tampoco se permite el empleo de cuentas múltiples para unirse a la comunidad y/o eventualmente, sobrepasar las sanciones aplicadas a las cuentas.')
            .addField(':six: No busques vacíos legales:', 'No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.\n\n```La infracción de la normativa conllevará desde sanciones administrativas (warn, mute, ban o kick) hasta avisos a las autoridades (en el caso de actividades ilegales).```');
        message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
