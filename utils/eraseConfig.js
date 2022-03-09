exports.run = async (client) => {

    //Vacia los ficheros de ./databases
    await new Promise((resolve, reject) => {

        client.fs.readdir('./databases/', async (err, databases) => {
            
            //Vacía cada una de las BDs
            databases.forEach(async (database, index, array) => {
                //Carga el nombre de la BD
                const databaseName = database.split('.')[0];

                //Vacía la BD
                client[databaseName] = {};

                //Graba la nueva BD en el almacenamiento
                await client.fs.writeFile(`./databases/${databaseName}.json`, JSON.stringify(client[databaseName], null, 4), (err) => console.error(err));

                console.log(` - [OK] Base de datos [${databaseName}] vaciada.`);

                //Resuelve la promesa
                if (index === array.length -1) resolve();
            });
        });
    });

    //Vuelve a generar ./configs
    await new Promise((resolve, reject) => {

        client.fs.readdir('./configs/cleanConfigs/', async (err, cleanConfigs) => {

            //Vacía cada una de las configs
            cleanConfigs.forEach(async (cleanConfig, index, array) => {
                //Carga el nombre de la config
                const cleanConfigName = cleanConfig.split('.')[0];

                //Reinicia todos los ficheros de config. menos el de claves
                if (cleanConfigName !== 'token') {
                    //Requiere la configuración en blanco
                    const cleanConfigContent = require(`../configs/cleanConfigs/${cleanConfigName}.json`);

                    //Vacía la config (clave por clave)
                    Object.keys(client.config[cleanConfigName]).forEach(key => {
                        client.config[cleanConfigName][key] = cleanConfigContent[key];
                    });

                    //Graba la nueva BD en el almacenamiento
                    await client.fs.writeFile(`./configs/${cleanConfigName}.json`, JSON.stringify(client.config[cleanConfigName], null, 4), (err) => console.error(err));

                    console.log(` - [OK] Configuración [${cleanConfigName}] regenerada.`);
                };

                //Resuelve la promesa
                if (index === array.length -1) resolve();
            });
        });
    });
};
