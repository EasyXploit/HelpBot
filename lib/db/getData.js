// Function to obtain a database data document, or all
export default async (dataType, dataId) => {

    try {

        // If no data was provided, abortes
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

            // Looks for data based on the ID provided
            const data = await DataModel.default.findOne({ [idType]: dataId });
            
            // Returns the data, or nothing if could not find it
            if (data) return data;
            else return false;

        } else {

            // Looks for all collection data
            const data = await DataModel.default.find();

            // Returns an array with the whole collection, or nothing if could not find anything
            if (data) return data;
            else return false;
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
