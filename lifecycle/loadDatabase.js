
exports.run = async () => {
    
    /*
    //
    if (process.env.NODE_ENV === 'production') {

        //
        console.log('PRODUCCIÓN');

    //
    } else if (process.env.NODE_ENV === 'development') {

        //
        console.log('DESARROLLO');
    };
    */

    //
    const mongoose = require('mongoose');

    //
    await mongoose.connect('mongodb://mongodb/admin');
        //.then(db => {console.log(`Conectado a: ${db.connection.host}`)})
        //.catch(error => console.error(error));
        
    /*
    const options = {
        auth: { 'authSource': process.env.DATABASE_AUTH_SOURCE },
        user: process.env.DATABASE_USER,
        pass: process.env.DATABASE_PASSWORD,
        useNewUrlParser: true, //To use the new connection string parser (the old one is deprecated) [mongoose.connect]
        useUnifiedTopology: true, //Enabled because Server Discovery and Monitoring engine is deprecated
        autoIndex: false, //Mongoose will not automatically build indexes for any model associated with this connection
        //poolSize: 5, //The maximum number of sockets the MongoDB driver will keep open for this connection 
        connectTimeoutMS: 10000, //How long the MongoDB driver will wait before killing a socket due to inactivity
        family: 4 //To connect using IPv4
    };

    mongoose.connect(process.env.DATABASE_CONNECTION_STRING, options); //Connect to the database
    mongoose.Promise = global.Promise; //Makes the Mongoose promieses available globally

    //Alerts when the bot is connected to the database
    mongoose.connection.on('connected', () => {
        console.log(`Mongoose connection to ${mongoose.db.connection.host} successfully opened!\n`);
    });

    //Alerts when the bot suffers a connection error with the database
    mongoose.connection.on('error', error => {
        console.error(`Mongoose connection error:\n${error.stack}`);
    });

    //Alerts when the bot disconnects from the database
    mongoose.connection.on('disconnected', () => {
        console.error('Mongoose connection aborted');
    });

    //Alerts when the reconnection try to the database fails
    mongoose.connection.on('reconnectFailed', () => {
        console.error('Mongoose reconnection try failed');
    });
    */

    //
    const userCreate = await mongoose.connection.db.command({
        createUser: "demoUser",
        pwd: "demoPassword",
        roles: [
            {"db":"admin", "role":"root"}
            //{"db":"admin", "role":"dbAdminAnyDatabase" }, 
            //{"db":"admin", "role":"readWriteAnyDatabase"}, 
            //{"db":"admin", "role":"clusterAdmin"}
        ]
    });

    //
    console.log(userCreate.ok === 1 ? "DB user created successfully" : "DB user creation failed");
};
