// Function to format a duration in milliseconds in a compact way (like "1d 2h 30m")
export default (milliseconds) => {

    // Stores the amount of days, hours and minutes of the duration
    const days = Math.floor(milliseconds / 86400000);
    const hours = Math.floor((milliseconds % 86400000) / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);

    // Returns the parts that are not 0 (or "0m" if all are)
    return [days > 0 ? `${days}d` : null, hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}m` : null].filter(part => part).join(' ') || '0m';
};
