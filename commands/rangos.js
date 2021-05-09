exports.run = async (discord, fs, client, message, args, command) => {
    
    //!rangos
    
    try {
        let helpEmbed = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('https://i.imgur.com/vDgiPwT.png')
            .setAuthor('NIVELES', 'https://i.imgur.com/vDgiPwT.png')
            .setDescription('Los miembros que participan __activamente__ en la comunidad (tanto en canales de texto cómo en canales de voz) adquieren puntos de **EXP**, y al alcanzar determinados niveles se obtienen rangos que aportan la siguientes _ventajas_:')
            .addField(`${client.emotes.chevron1} Lvl 1 ‣ NOVATO I`, 'Permite **publicar en <#428234707927564299>**.\nObtienes __50 créditos__ de bienvenida.')
            .addField(`${client.emotes.chevron2} Lvl 5 ‣ NOVATO V`, 'Permite **adjuntar archivos** e **insertar enlaces**.\nObtienes __100 créditos__.')
            .addField(`${client.emotes.chevron3} Lvl 10 ‣ PROFESIONAL V`, `Permite **cambiar tu apodo** y **usar emojis externos**${client.emotes.nitro}.\nObtienes __200 créditos__.`)
            .addField(`${client.emotes.chevron4} Lvl 15 ‣ EXPERTO V`, 'Permite **manejar la música** y **enviar mensajes TTS**.\nObtienes __300 créditos__.')
            .addField(`${client.emotes.chevron5} Lvl 15 ‣ VETERANO V`, 'Permiite utilizar la  **prioridad de palabra**.\nObtienes __400 créditos__.')
            .addField('● Estadísticas', 'Usa `!rank` para conocer tu nivel.\nUsa `!leaderboard` para ver la tabla de clasificación.');
        
        await message.channel.send(helpEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
