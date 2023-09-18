//Importa las librerías necesarias
import inquirer from 'inquirer';
import { splashLogo } from 'helpbot/loaders';

//Almacena las traducciones del bot
const locale = client.locale.lib.menus.baseGuildSelection;

//Exporta una función por defecto
export default async (elegibleGuilds) => {

    //Carga el ID de la guild base
    const baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

    //Almacena el ID de la nueva guild base
    let newBaseGuildId = null;

    //Función para preguntar la nueva guiid base al usuario
    async function promptBaseGuildSelection() {

        //Limpia la consola y muestra el logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);

        //Muestra la ayuda para elegir una nueva guild base
        console.log(`🧹 ${locale.promptBaseGuildSelectionHeader1}`);
        console.log(`👋 ${locale.promptBaseGuildSelectionHeader2}\n`);

        //Genera la pregunta del selector de guild base
        const questions = [
            {
                type: 'list',
                name: 'baseGuildId',
                message: locale.selectANewBaseGuild,
                choices: elegibleGuilds.map(guild => ({ name: `${guild.name} (${guild.id})${guild.id === baseGuildId ? ` - ${locale.alreadyConfiguredGuild}` : ''}`, value: guild })),
            }
        ];

        //Pregunta la guild base
        const { baseGuildId: newBaseGuild } = await inquirer.prompt(questions);

        //Si la guild base es distinta a la actualmente configurada
        if (baseGuildId && newBaseGuild.id !== baseGuildId) {

            //Pregunta al usuario si está seguro de cambiar la guild base
            const confirmation = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'isSure',
                    message: `${locale.isSureToReplaceBaseGuild} (${locale.affirmativeAnswer}/${locale.negativeAnswer})`
                }
            ]);

            //Regresa al selector si el usuario no está seguro
            if (locale.affirmativeAnswer !== confirmation.isSure.toLowerCase()) return promptBaseGuildSelection();
        };

        //Almacena el nuevo baseGuildId
        newBaseGuildId = newBaseGuild.id;

        //Limpia la consola y muestra el logo
        process.stdout.write('\u001b[2J\u001b[0;0H');
        await splashLogo(client.locale.lib.loaders.splashLogo);
    };

    //Ejecuta el selector de guild base
    await promptBaseGuildSelection();

    //Por cada guild en caché
    for (let guild of elegibleGuilds.values()) {

        //Si la guild es la nueva guild base, omite
        if (guild.id === newBaseGuildId) continue;

        //Muestra por consola la guild a abandonar
        logger.debug(`${await client.functions.utils.parseLocale(locale.leavingGuild, { guild: `"${guild.name}" (${guild.id})` })} ...`);

        //Abandona la guild
        await guild.leave();

        //Elimina la guild de cachedGuilds
        elegibleGuilds.delete(guild.id);
    };

    //Devuelve el nuevo objeto de guilds elegibles
    return elegibleGuilds
};
