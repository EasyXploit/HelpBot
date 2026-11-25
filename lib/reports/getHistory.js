// Function to obtain the history of reports of a user: the reports about it (the newest first), the amount of each status and the amount of reports made by it
export default async (userId) => {

    // Stores the reports about the user, sorted from the newest to the oldest
    const reports = (await client.functions.db.getData('report', null, { 'target.userId': userId }) || []).sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    // Stores the amount of reports of each status
    const countStatus = statuses => reports.filter(report => statuses.includes(report.status)).length;

    // Returns the history
    return {
        reports: reports,
        counts: {
            total: reports.length,
            open: countStatus(['pending', 'assigned']),
            resolved: countStatus(['resolved']),
            dismissed: countStatus(['dismissed'])
        },
        madeByUser: (await client.functions.db.getData('report', null, { 'reports.reporterId': userId }) || []).length
    };
};
