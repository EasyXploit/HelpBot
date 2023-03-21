## Scripts de migración
Este directorio contiene los scripts de migración de documentos, los cuales son utilizados por 
la dependencia "migrate-mongo" para actualizar o desactualizar los documentos existentes a nuevas
o viejas versiones, tal y cómo se describe en: https://www.npmjs.com/package/migrate-mongo

Los ficheros deben contener código de la siguiente forma:
 
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
