// Function to generate random entire numbers within a range
export default async (min, max) => {

    // Rounds up the minimum
    min = Math.ceil(min);

    // Rounds up the maximum
    max = Math.floor(max);

    // Returns a random integer between Min and Max
    return Math.floor(Math.random() * (max - min + 1)) + min;
};