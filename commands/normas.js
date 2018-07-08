const config = require ("../config.json");        
exports.run = (bot, message, args) => {
    message.channel.send ({embed: {
        "title": "Normas de la comunidad",
        "color": 16762967,
        "description": "Este servidor se apoya en los **Términos de Servicio** y las **Directivas de la comunidad de Discord**",

        "author": {
            "name": "Pilko Bot",
            "url": "https://discord.gg/j4y9xcY",
            "icon_url": bot.user.avatarURL,
        },

        "fields": [
          {
            "name": ":one:  **No está permitido publicar contenido inadecuado:**",
            "value": "Es decir, todo lo relacionado con pornografía, drogas y apuestas (excepto en #nsfw ). Tampoco contenido que pueda alentar el odio hacia una etnia, religión o cualquier otro colectivo/individuo. De la misma forma están prohibidas las actitudes tóxicas, faltas de respeto, el acoso, el gore y/o crueldad animal y el envío de pornografía infantil.",
            "inline": true,
          },
          {
            "name": ":two: **Está prohibido hacer spam:**",
            "value": "No puedes enviar links hacia otros servidores de Discord _(tanto invitaciones como URL redireccionadas o spam relacionado)_, ni links de afiliado. Tampoco puedes abusar de las menciones a los demás usuarios y también está prohibido hacer _flood_ de chat. __Si deseas que te promocionemos, contáctanos.__",
            "inline": true,
          },
          {
            "name": ":three: **No abuses de las menciones:**",
            "value": "No está permitido excederse utilizando las menciones a personas, a __roles__, o a `@everyone` y `@here`. _Las menciones abusivas pueden ser realmente molestas y pueden llevar a los usuario a silenciar el servidor._",
            "inline": true,
          },
          {
            "name": ":four: **Respeta las temáticas:**",
            "value": "Has de usar los canales de texto/voz adecuados en cada caso. Lee los temas de los canales para más información.",
            "inline": true,
          },
          {
            "name": ":five: **No busques vacíos legales:**",
            "value": "No intentes hacer algo que obviamente pueda resultar inadecuado tanto para el staff como para el resto de usuarios de la comunidad.",
            "inline": true,
          },
        ],
        footer: {
            icon_url: bot.user.avatarURL,
            text: "© 2018 República Gamer",
        }
    }}).catch(console.error);
    console.log ("》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
}