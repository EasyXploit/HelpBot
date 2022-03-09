exports.run = async (client, message, args, command, commandConfig) => {

    //!roleinfo (@rol | rol | id)

    try {
        let incorrectSyntaxEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.main.prefix}roleinfo (@rol | rol | id)\`.`);

        if (!args[0]) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        await client.functions.fetchRole(message.guild, args[0]).then(role => {

            let roleNotFoundEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} El rol no se ha podido encontrar`);

            if (!role) return message.channel.send({ embeds: [roleNotFoundEmbed] });

            let membersWithRole = message.guild.roles.cache.get(role.id).members.size;
            let mentionable = 'No';
            let hoisted = 'Oculto';
            let managed = 'Local';

            if (role.mentionable === true) {
                mentionable = 'Si'
            };
            
            if (role.hoist === true) {
                hoisted = 'Visible'
            };
            
            if (role.managed === true) {
                managed = 'Externa'
            };

            let resultEmbed = new client.MessageEmbed()
                .setColor(role.hexColor)
                .setTitle('🔖 Información de rol')
                .setDescription(`Mostrando información acerca del rol <@&${role.id}>`)
                .addField('🏷 Nombre del rol', role.name, true)
                .addField('🆔 ID del rol', role.id, true)
                .addField('👥 Miembros con el rol', membersWithRole.toString(), true)
                .addField('🗣 Mencionable', mentionable, true)
                .addField('👁️‍ Se muestra', hoisted, true)
                .addField('🔰 Color', role.hexColor, true)
                .addField('📝 Fecha de creación', role.createdAt.toLocaleString(), true)
                .addField('⚙ Administración', managed, true)

            message.channel.send({ embeds: [resultEmbed] });
        }).catch(error => {
            console.log(`${new Date().toLocaleString()} 》${error.stack}`);
        });

        
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'roleinfo',
    aliases: ['role']
};
