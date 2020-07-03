exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-removerole (@rol | "rol" | id) (@usuario | id)

    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.staffPrefix}removerole (@rol | "rol" | id) (@usuario | id)\``);

        if (args.length < 2) return message.channel.send(noCorrectSyntaxEmbed);
        
        const guild = message.guild;
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            let newArgs = message.content.slice(13).split(`" `).slice(0, 1).join();
            role = message.guild.roles.find(r => r.name === newArgs);
        }
        let member = await message.guild.members.fetch(message.mentions.users.first() || args[1]);
 
        if (!role || !member) return message.channel.send(noCorrectSyntaxEmbed);
        
        let moderator = await message.guild.members.fetch(message.author);
        
        //Se comprueba si puede banear al usuario
        if (moderator.id !== member.id && author.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        let notAssignedEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Este usuario no dispone del rol \`${role.name}\``);
        
        if (!member.roles.has(role.id)) return message.channel.send(notAssignedEmbed);

        if(message.author.id === config.botOwner) {

            await member.removeRole(role);

            let successEmbed = new discord.MessageEmbed ()
                .setColor(resources.green)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`Retiraste el rol **${role.name}** al usuario **${member.displayName}**.`);

            let loggingEmbed = new discord.MessageEmbed ()
                .setColor(resources.blue)
                .setTitle(`📑 Auditoría`)
                .setDescription(`Se ha retirado un rol.`)
                .addField(`Fecha:`, new Date().toLocaleString(), true)
                .addField(`Emisor:`, `<@${message.author.id}>`, true)
                .addField(`Rol:`, role.name, true)
                .addField(`Destino:`, member.user.tag, true)
                .setFooter(bot.user.username, bot.user.avatarURL).setTimestamp();
            
            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
            
        } else if (message.member.roles.has(config.botStaff)) {
            
            let permittedRoles = [`ES`, `LATAM`, `CS:GO`, `RAINBOW SIX`, `FORTNITE`, `ROCKET LEAGUE`, `LOL`, `MINECRAFT`, `BATTLEFIELD`, `PUBG`, `GTA V`, `ROBLOX`, `OVERWATCH`, `BO4`, `TERRARIA`, `STARDEW VALLEY`, `BRAWLHALLA`, `ARK`, `MHW`, `L4D2`, `PAYDAY 2`, `FIFA`, `THE FOREST`]
            
            if (message.member.roles.has(config.botSupervisor)) {
                permittedRoles.push(`NOVATO`, `INICIADO`, `PROFESIONAL`, `VETERANO`, `EXPERTO`, `DJ`)
            }

            let successEmbed = new discord.MessageEmbed ()
                .setColor(resources.green)
                .setTitle(`${resources.GreenTick} Operación completada`)
                .setDescription(`Retiraste el rol ${role.name} al usuario **${member.displayName}**.`);

            let loggingEmbed = new discord.MessageEmbed ()
                .setColor(resources.blue)
                .setTitle(`📑 Auditoría`)
                .setDescription(`Se ha retirado un rol.`)
                .addField(`Fecha:`, new Date().toLocaleString(), true)
                .addField(`Emisor:`, `<@${message.author.id}>`, true)
                .addField(`Rol:`, role.name, true)
                .addField(`Destino:`, `<@${member.id}>`, true)
                .setFooter(bot.user.username, bot.user.avatarURL).setTimestamp();
            
            if (permittedRoles.some(roleName => role.name === roleName)) {
                await member.removeRole(role);
                
                await message.channel.send(successEmbed);
                await loggingChannel.send(loggingEmbed);

            } else {
                let noPrivilegesEmbed = new discord.MessageEmbed ()
                    .setColor(resources.red)
                    .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para retirar este rol`);
                message.channel.send(noPrivilegesEmbed);
            }
        }
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
