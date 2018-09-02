return;

//Comando deshabilitado
let disabledEmbed = new discord.RichEmbed()
    .setColor(0xC6C9C6)
    .setDescription('❕ Comando `' + message.content + '` deshabilitado temporalmente');
message.channel.send(disabledEmbed);
return;

//Fase experimental
let experimentalEmbed = new discord.RichEmbed()
    .setColor(0xC6C9C6)
    .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
message.channel.send(experimentalEmbed);