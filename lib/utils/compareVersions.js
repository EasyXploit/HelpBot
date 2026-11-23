// Function to read a version that follows semantic versioning (like "1.2.3" or "v1.2.3-beta.1"), that returns its parts, or null if it does not follow it
export function parseVersion(version) {

    // Checks if the version follows semantic versioning (with an optional "v" before it)
    const match = String(version).trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);

    // Returns null if it does not follow it
    if (!match) return null;

    // Returns the numbers of the version, and the identifiers of the pre-release (if any)
    return { numbers: match.slice(1, 4).map(Number), preRelease: match[4] ? match[4].split('.') : [] };
};

// Function to compare two versions, following the precedence of semantic versioning, that returns 1 if the first one is newer, -1 if it is older, or 0 if they are the same
// The versions that do not follow semantic versioning are considered older than any that does
export default (firstVersion, secondVersion) => {

    // Reads both versions
    const first = parseVersion(firstVersion);
    const second = parseVersion(secondVersion);

    // If any of them does not follow semantic versioning, the one that does is the newer
    if (!first || !second) return first ? 1 : second ? -1 : 0;

    // Compares the major, minor and patch numbers
    for (let index = 0; index < 3; index++) {
        if (first.numbers[index] !== second.numbers[index]) return first.numbers[index] > second.numbers[index] ? 1 : -1;
    };

    // A version without pre-release is newer than the same version with it (for example, "1.0.0" is newer than "1.0.0-beta.1")
    if (first.preRelease.length === 0 || second.preRelease.length === 0) return first.preRelease.length === second.preRelease.length ? 0 : first.preRelease.length === 0 ? 1 : -1;

    // Compares the identifiers of the pre-releases one by one
    for (let index = 0; index < Math.max(first.preRelease.length, second.preRelease.length); index++) {

        // Stores the identifiers (the version with fewer identifiers is the older, if the previous ones are the same)
        const firstId = first.preRelease[index], secondId = second.preRelease[index];
        if (firstId === undefined) return -1;
        if (secondId === undefined) return 1;
        if (firstId === secondId) continue;

        // Numeric identifiers are compared as numbers, and are older than the alphanumeric ones, which are compared as text
        const firstIsNumber = /^\d+$/.test(firstId), secondIsNumber = /^\d+$/.test(secondId);
        if (firstIsNumber && secondIsNumber) return Number(firstId) > Number(secondId) ? 1 : -1;
        if (firstIsNumber !== secondIsNumber) return firstIsNumber ? -1 : 1;
        return firstId > secondId ? 1 : -1;
    };

    // Returns that they are the same
    return 0;
};
