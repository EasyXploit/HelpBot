// Function to generate sIds
export default async (length) => {
        
    // Requires the Id's generator with a personalized alphabet
    const { customAlphabet } = await import('nanoid');

    // Assigns the alphabet and the length of the Id
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length || 10);

    // Returns the generated sId
    return nanoid();
};