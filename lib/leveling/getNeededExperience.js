// Function to calculate the experience necessary to achieve the next level based on experience
export default async (experience) => {

    // Stores the currently iterated level
    let iteratedLevel = 0;

    // Stores the XP of the next level
    let nextLevelExperience;

    // While the current XP is greater than or equal to the one necessary to rise to the next level
    while (!nextLevelExperience || experience >= nextLevelExperience) {
        
        // Increases the level counter
        if (nextLevelExperience) iteratedLevel++;

        // Updates the XP required for the next level
        nextLevelExperience = Math.round(5 * Math.pow(iteratedLevel, 3) + 50 * iteratedLevel + 100);
    };

    // Returns an object with the necessary experience and the level that will be achieved
    return { experience: nextLevelExperience - experience, nextLevel: iteratedLevel };
};
