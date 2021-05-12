exports.run = async (discord, client, message, args, command) => {
    
    //!boxbot
    
    try {
        let helpEmbed1 = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
            .setTitle(`BoxBot, el minijuego ${client.emotes.boxbot}`)
            .setDescription('**Recuerda que estos comandos sólo pueden ser utilizados en los canales de texto <#433376010688397312> y <#760952548873601047>**\n\n⏰ __**Cooldowns:**__\n• `b!cooldowns <@usuario>` _Muestra los tiempos de espera._\n• `b!hourly` _Otorga 1 caja común cada hora._\n• `b!daily` _Otorga 1 caja rara cada día._\n• `b!weekly` _Otorga una caja ultra rara cada semana._\n• `b!trivia` _Inicia un trivia con recompensa._\n• `b!claim` _Te recompensa por votar cada 12h._\n• `b!coinflip <cantidad>` _Te permite apostar tu dinero a cara o cruz._\n\n🔫 __**Objetos y cantidades:**__\n• `b!health <@usuario>` _Permite visualizar el estado de salud._\n• `b!image <objeto>` _Te muestra la imagen del objeto._\n• `b!inventory <@usuario>` _Abre un inventario._\n• `b!items` _Muestra el listado de objetos._\n• `b!item <objeto>` _Muestra la info. de un objeto._\n• `b!money <@usuario>` _Muestra la cantidad de dinero._\n• `b!value <@usuario>` _Muestra el valor de un inventario._\n\n🛡 __**Acciones:**__\n• `b!use <objeto>` _Te permite usar un objeto._\n• `b!heal <objeto>` _Te permite curarte con un objeto._\n• `b!buy <objeto>` _Te permite comprar un objeto (ver `b!items` para saber cual)._\n• `b!sell <objeto>` _Te permite vender un objeto (ver `b!items` para saber cual)._\n• `b!sellall <categoría>` _Vende todos los objetos de un categoría (o todos)._\n• `b!trade <@usuario>` _Te permite intercambiar objetos con otro miembro._\n\n📊 __**Estadísticas:**__\n• `b!profile <@usuario>` _Te permite ver el perfil de un miembro._\n• `b!players` _Te permite ver quienes están jugando a BoxBot._\n• `b!top` _Muestra la tabla de clasificación local._\n• `b!gtop` _Muestra la tabla de clasificación global._\n• `b!changelog` _Muestra la lista de cambios de esta versión de BoxBot._\n• `b!ping` _Calcula la latencia/tiempo de respuesta de BoxBot._\n\n⚙ __**Ajustes:**__\n• `b!settings` _Muestra tus ajustes._\n• `b!optin` _Te permite jugar en el servidor._\n• `b!optout` _Te excluye de jugar en un servidor._');

        let helpEmbed2 = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setDescription('🏳️‍🌈 __**Skins (Patreon):**__\n• `b!pclaim` _Recoge tus créditos mensuales._\n• `b!credits` _Muestra tu cantidad actual de créditos._\n• `b!usecredit` _Desbloquea una skin gastando 1 crédito._\n• `b!skins` _Muestra tu inventario de skins._\n• `b!skinequip <objeto;;skin>` _Equipa una skin en un arma._\n• `b!skinunequip <objeto;;skin>` _Quita una skin de un arma._\n• `b!equipallskins` _Equipa todas las skins._');

        await message.channel.send(helpEmbed1);
        await message.channel.send(helpEmbed2);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};