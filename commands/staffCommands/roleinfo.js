exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //-roleinfo (@rol | rol | id)

    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.staffPrefix}roleinfo (@rol | rol | id)\``);

        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);

        let guild = message.guild;
        let role = message.mentions.roles.first() || guild.roles.cache.get(args[0]) || message.guild.roles.find( r => r.name === args.join(` `));

        let roleNotFoundEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} El rol no existe`);

        if (!role) return message.channel.send(roleNotFoundEmbed);

        let membersWithRole = message.guild.roles.cache.get(role.id).members.size;
        let mentionable = `No`;
        let hoisted = `Oculto`;
        let managed = `Local`;

        if (role.mentionable === true) {
            mentionable = `Si`
        };
        
        if (role.hoist === true) {
            hoisted = `Visible`
        };
        
        if (role.managed === true) {
            managed = `Externa`
        };

        let resultEmbed = new discord.MessageEmbed ()
            .setColor(role.hexColor)
            .setTitle(`🔖 Información de rol`)
            .setDescription(`Mostrando información acerca del rol <@&${role.id}>`)
            .addField(`🏷 Nombre del rol`, role.name, true)
            .addField(`🆔 ID del rol`, role.id, true)
            .addField(`👥 Miembros con el rol`, membersWithRole, true)
            .addField(`🗣 Mencionable`, mentionable, true)
            .addField(`👁️‍ Se muestra`, hoisted, true)
            .addField(`🔰 Color`, role.hexColor, true)
            .addField(`📝 Fecha de creación`, role.createdAt.toLocaleString(), true)
            .addField(`⚙ Administración`, managed, true)

        message.channel.send(resultEmbed);
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
