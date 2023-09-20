// Function to convert MS to a formatted time
export default async (ms) => {

    // Stores the translations
    const locale = client.locale.lib.utils.msToTime;

    // Converts the MS to seconds
    let seconds = parseInt(ms / 1000);

    // Extracts the years
    const years = parseInt(Math.floor(seconds / 31536000));
    seconds = seconds % 31536000;

    // Extracts the months
    const months = parseInt(Math.floor(seconds / 2629800));
    seconds = seconds % 2629800;

    // Extracts the days
    const days = parseInt(seconds / 86400);
    seconds = seconds % 86400;

    // Extracts the hours
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    // Extracts the minutes
    const minutes =  parseInt(seconds / 60);

    // Stores the seconds not extracted from the minutes
    seconds = parseInt(seconds % 60);

    // Shows filling zeros if necessary
    const hoursStr = ('00' + hours).slice(-2);
    const minutesStr = ('00' + minutes).slice(-2);
    const secondsStr = ('00' + seconds).slice(-2);

    // Returns the result
    return `${years > 0 ? `${years} ${locale.years}, ` : ''}${months > 0 ? `${months} ${locale.months}, ` : ''}${days > 0 ? `${days} ${locale.days}, ` : ''}${hoursStr}:${minutesStr}:${secondsStr}`;
};