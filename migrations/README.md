# Scripts de migración
Este directorio contiene los scripts de migración de documentos, los cuales son utilizados por 
la dependencia "migrate-mongo" para actualizar o desactualizar los documentos existentes a nuevas
o viejas versiones, tal y cómo se describe en: https://www.npmjs.com/package/migrate-mongo

Los scripts deben contener código de la siguiente forma:
 
 ```js
module.exports = {
    async up(db) {
        //await db.collection('configs').updateOne({ docType: 'system'}, { $set: { test: '' } });
    },
 
    async down(db) {
        //await db.collection('configs').updateOne({ docType: 'system'}, { $unset: { test: '' } });
    }
};
```

> Estos scripts no se ejecutarán al cargar la conexión con la base de datos si `process.env.NODE_ENV != "production"`, por lo que para emplearlos en otros entornos, es necesario invocarlos mediante comandos de CLI o hacerlo con instrucciones adicionales para ejecutar el método `client.functions.db.migrate`.