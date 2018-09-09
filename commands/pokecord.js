exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    const pokeball = bot.emojis.find('name', 'pokeball');

    let successEmbed = new discord.RichEmbed()
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Pokécord, el minijuego ' + pokeball)

        .setColor(0xFFC857)
        .setDescription('**Básico** \n • `p!start`   _comienza tu aventura Pokémon._ \n • `p!pick`   _elige a tu Pokémon inicial (p!start muestra los elegibles)_ \n • `p!daily`   _te da una recompensa diaria._ \n \n **Comandos Pokémon (básicos)** \n • `p!info`   _muestra información sobre tu Pokémon elegido._ \n • `p!pokemon`   _muestra una lista con tus Pokémons._ \n • `p!fav`   _muestra la lista de tus Pokémons favoritos._ \n • `p!addfav [nº de Pokémon]`   _añade un Pokémon a tus favoritos._ \n • `p!removefav [nº de Pokémon]`   _quita a un Pokémon de tus favoritos._ \n • `p!nickname [nick]`   _cambia el apodo a tu Pokémon seleccionado._ \n • `p!dropitem`   _suelta el objeto que lleva tu Pokémon._ \n • `p!select [nº]`   _selecciona a uno de tus Pokémons como principal._ \n • `p!catch [Pokémon]`   _captura al Pokémon que ha aparecido._ \n  \n **Comandos Pokémon (interacción)** \n • `p!release [nº de Pokémon]`   _libera a un Pokémon._ \n • `p!duel [@usuario]`   _reta a un combate a otro entrenador._ \n • `p!trade [@usuario]`   _ofrece un intercambio a otro entrenador._ \n • `p!moves`   _dice que movimientos puede aprender tu Pokémon._ \n • `p!learn [movimiento]`   _enseña un movimiento a tu Pokémon._ \n • `p!shop`   _abre la tienda de objetos._ \n • `p!buy [ID de objeto]`   _compra un objeto._ \n \n**Recuerda que estos comandos sólo pueden ser utilizados en los canales de texto <#433376047833022513> y <#473113746139774996>**')
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL);
    message.channel.send(successEmbed);
}
