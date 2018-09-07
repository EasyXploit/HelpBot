return;

//EMBED COMPLETO
let embed = new discord.RichEmbed()
      .setTitle('Este es el título, y puede contener 256 carácteres')
      .setAuthor('Nombre del autor', 'https://i.imgur.com/lm8s41J.png')
      /*
       * Alternativamente, usa "#00AE86", [0, 174, 134] o un número integral.
       */
      .setColor(0x00AE86)
      .setDescription('Este es el cuerpo principal del texto, puede contener 2048 carácteres.')
      .setFooter('Este es el texto del pie de página, puede contener 2048 caracteres', 'http://i.imgur.com/w1vhFSR.png')
      .setImage('http://i.imgur.com/yVpymuV.png')
      .setThumbnail('http://i.imgur.com/UoPJjLZ.png')
      /*
       * Toma un objeto de fecha, por defecto a la fecha actual.
       */
      .setTimestamp()
      .setURL('https://discord.js.org/#/docs/main/indev/class/RichEmbed')
      .addField('Este es el título de un campo, puede contener 256 carácteres',
        'Este es el valor de un campo, puede contener 2048 carácteres.')
      /*
       * Los campos en línea pueden no mostrarse como en línea si la miniatura y/o la imagen son demasiado grandes.
       */
      .addField('Campo alineado', 'También pueden estar en línea.', true)
      /*
       * Campo en blanco, útil para crear espacio.
       */
      .addBlankField(true)
      .addField('Campo alineado 3', 'Puedes tener un máximo de 25 campos.' true);

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