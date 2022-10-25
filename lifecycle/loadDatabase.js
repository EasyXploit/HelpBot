
exports.run = async () => {
    
    const mongoose = require('mongoose');

    await mongoose.connect('mongodb://mongodb/admin')
        .then(db => {console.log(`Conectado a: ${db.connection.host}`)})
        .catch(error => console.error(error));

};
