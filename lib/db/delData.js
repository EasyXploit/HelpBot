// Function to delete a data document from the database, or all
export default async (dataType, dataId) => {

    try {

        // If no data was provided, aborts
        if (!dataType) return false;

        // Imports the corresponding script to the required model
        const DataModel = await import(`../../models/data/${dataType}.js`);

        // If an ID for search was provided
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

            // Looks for the data based on the ID provided, and eliminates the document
            const data = await DataModel.default.deleteOne({ [idType]: dataId });
            
            // Returns the number of deleted documents, or false if none
            if (data.deletedCount > 0) return data.deletedCount;
            else return false;

        } else {

            // Deletes all documents from the collection
            const data = await DataModel.default.deleteMany({});

            // Returns the number of deleted documents, or false if none
            if (data.deletedCount > 0) return data.deletedCount;
            else return false;
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
