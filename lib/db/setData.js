// Function to modify a database data document, or all
export default async (dataType, dataId, newData, filters) => {

    try {

        // If no data was provided, aborts
        if (!dataType || !newData || typeof newData !== 'object') return false;

        // Imports the corresponding script to the required model
        const DataModel = await import(`../../models/data/${dataType}.js`);

        // If an Id for search was provided
        if (dataId) {

            // Creates a variable to store the property to search
            let idType;
            
            // Selects the property to search according to the model
            switch (dataType) {
                case 'ban':
                case 'profile':
                case 'timeout':
                    idType = 'userId';
                    break;   
                case 'poll':
                    idType = 'pollId';
                    break;
                case 'sent':
                    idType = 'hash';
                    break;
            };

            // Looks for the data based on the Id provided, and eliminates the document
            const data = await DataModel.default.updateOne({ [idType]: dataId }, newData);
            
            // Returns the number of modified documents, or false if none
            if (data.modifiedCount > 0) return data.modifiedCount;
            else return false;

        } else {

            // Updates all documents in the collection, or what fit the filters
            const data = await DataModel.default.updateMany(filters || {}, newData);

            // Returns the number of modified documents, or false if none
            if (data.modifiedCount > 0) return data.modifiedCount;
            else return false;
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
