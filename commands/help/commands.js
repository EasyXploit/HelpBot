exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!commands
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .attachFiles(new discord.MessageAttachment('./resources/images/logo.png', 'logo.png'))
            .setThumbnail('attachment://logo.png')
            .setAuthor(client.user.username, client.user.avatarURL())
            .setDescription(`Comandos de ${client.user.username}`)
            .addField(`🎶 ${client.config.guild.prefix}music`, 'Muestra la ayuda para reproducir música en los canales de voz.')
            .addField(`🎙 ${client.config.guild.prefix}sound (término)`, `Busca y reproduce una grabación (Usa \`${client.config.guild.prefix}sound list\` para ver la lista de grabaciones disponibles).`)
            .addField(`🌐 ${client.config.guild.prefix}translate (idioma orígen) (idioma destino) (texto a traducir)`, 'Traduce un texto proporcionado (usa códigos de idioma. P. ej: _en_)')
            .addField(`👦 ${client.config.guild.prefix}avatar (@usuario)`,  'Muestra tu avatar o el de cualquier miembro.')
            .addField(`🌦 ${client.config.guild.prefix}weather (ubicación)`,  'Obtiene información metereológica acerca de la ubicación proporcionada.')
            .addField(`🎭 ${client.config.guild.prefix}meme`, 'Muestra un meme aleatorio en Español.')
            .addField(`🎲 ${client.config.guild.prefix}dice`, 'Lanzará un dado.')
            .addField(`🪙 ${client.config.guild.prefix}flipcoin`, 'Lanzará una moneda.')
            .addField(`🎱 ${client.config.guild.prefix}8ball (pregunta)`, 'La bola mágica te dará una respuesta.')
            .addField(`✂ ${client.config.guild.prefix}rps (piedra | papel | tijeras)`, `Juega a Piedra, Papel y Tijeras con ${client.user.username}.`)
            .addField(`🦎 ${client.config.guild.prefix}rpsls (piedra | papel | tijeras | lagarto | spock)`, `Juega a Piedra, Papel, Tijeras, Lagarto y Spock con ${client.user.username}.`)
            .addField(`📔 ${client.config.guild.prefix}urban (término)`, 'Busca en el Urban Dictionary (en inglés)')
            .addField(`🎯 ${client.config.guild.prefix}choose "opción1" "opción2" ...`, `${client.user.username} elegirá por ti de entre las opciones que le facilites.`)
            .addField(`📝 ${client.config.guild.prefix}reverse (texto)`, `${client.user.username} le dará la vuelta al texto que especifiques.`)
            .addField(`⏱ ${client.config.guild.prefix}ping`, `Comprueba el tiempo de respuesta entre el cliente y ${client.user.username}`);
        message.channel.send(helpEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'commands',
    aliases: ['cmds']
};
