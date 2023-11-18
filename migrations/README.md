# Migration scripts
This directory contains the document migration scripts, which are used by
"migrate-mongo" dependency to update or downgrade existing documents to new ones
or old versions, as described in: https://www.npmjs.com/package/migrate-mongo

Scripts must contain code as follows:
 
 ```js
export default {
    async up(db) {
        //await db.collection('configs').updateOne({ docType: 'system'}, { $set: { test: '' } });
    },
 
    async down(db) {
        //await db.collection('configs').updateOne({ docType: 'system'}, { $unset: { test: '' } });
    }
};
```

> These scripts will not be executed when loading the database connection if `process.env.NODE_ENV != "production"`, so to use them in other environments, it is necessary to invoke them through CLI commands or do so with additional instructions to execute the `client.functions.db.migrate` method.

> This script can also be used to migrate files such as `config.json`, which is not overwritten during an automatic update (so should be checked if it adapts to new versions).