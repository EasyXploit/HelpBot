exports.run = async (client, message, args, command, commandConfig) => {

    try {

        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

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
                .addField('📝 Fecha de creación', `<t:${Math.round(role.createdTimestamp / 1000)}>`, true)
                .addField('⚙ Administración', managed, true)

            message.channel.send({ embeds: [resultEmbed] });
        }).catch(error => {
            console.error(`${new Date().toLocaleString()} 》ERROR:`, error.stack);
        });

        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'roleinfo',
    description: 'Muestra información sobre un rol.',
    aliases: ['role'],
    parameters: '<@rol | nombre de rol | id>'
};
