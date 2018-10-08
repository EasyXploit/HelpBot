exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-quitar-rol (@rol | "rol" | id) (@usuario | id)

    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.staffPrefix + 'quitar-rol (@rol | "rol" | id) (@usuario | id)`');

        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
        
        const guild = message.guild;
        let role = message.mentions.roles.first() || message.guild.roles.get(args[0]);
        if (!role) {
            let newArgs = message.content.slice(13).split('" ').slice(0, 1).join();
            role = message.guild.roles.find('name', newArgs);
        }
        let member = message.mentions.members.first() || message.guild.members.get(args[1]);
 
        if (!role || !member) return message.channel.send(noCorrectSyntaxEmbed);
        
        let author = message.guild.member(message.author.id)
        
        //Se comprueba si puede banear al usuario
        if (author.id !== member.id && author.id !== message.guild.owner.id) {
            if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        let notAssignedEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este usuario no dispone del rol `' + role.name + '`');
        
        if (!member.roles.has(role.id)) return message.channel.send(notAssignedEmbed);

        if(message.author.id === config.botOwner) {

            await member.removeRole(role);

            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setTitle(resources.GreenTick + ' Operación completada')
                .setDescription('Retiraste el rol **' +  role.name + '** al usuario **' + member.displayName + '**.');

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0x4A90E2)
                .setTitle('📑 Auditoría')
                .setDescription('Se ha retirado un rol.')
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL)
                .addField('Fecha:', new Date().toUTCString(), true)
                .addField('Emisor:', '<@' + message.author.id + '>', true)
                .addField('Rol:', role.name, true)
                .addField('Destino:', member.user.tag, true)
            
            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);

            console.log('\n 》' + message.author.username + ' retiró el rol ' + role.name + ' al usuario ' + member.displayName + '.');
            
        } else if (message.member.roles.has(config.botStaff)) {
            
            let permittedRoles = ['ES', 'LATAM', 'CS:GO', 'RAINBOW SIX', 'FORTNITE', 'ROCKET LEAGUE', 'LOL', 'MINECRAFT', 'BATTLEFIELD', 'PUBG', 'GTA V', 'ROBLOX', 'OVERWATCH']
            
            if (message.member.roles.has(config.botSupervisor)) {permittedRoles.push('NOVATOS', 'INICIADOS', 'PROFESIONALES', 'VETERANOS', 'EXPERTOS', 'DJ')}
    

            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setTitle(resources.GreenTick + ' Operación completada')
                .setDescription('Retiraste el rol ' +  role.name + ' al usuario **' + member.displayName + '**.');

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL)
                .setTitle('📑 Auditoría')
                .setDescription('Se ha retirado un rol.')
                .addField('Fecha:', new Date().toUTCString(), true)
                .addField('Emisor:', '<@' + message.author.id + '>', true)
                .addField('Rol:', role.name, true)
                .addField('Destino:', '<@' + member.id + '>', true)
            
            if (permittedRoles.some(roleName => role.name === roleName)) {
                await member.removeRole(role);
                
                await message.channel.send(successEmbed);
                await loggingChannel.send(loggingEmbed);

                console.log('\n 》' + message.author.username + ' retiró el rol ' + role.name + ' al usuario ' + member.displayName + '.');
            } else {
                let noPrivilegesEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setDescription(resources.RedTick + ' ' + message.author.username + ', no dispones de privilegios suficientes para retirar este rol');
                message.channel.send(noPrivilegesEmbed);
            }
        }
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
