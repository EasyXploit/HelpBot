// Migration that moves the settings of the member reports from the logging system to their own settings in the moderation module
export async function up(db) {

    // Stores the collection of the configurations
    const configs = db.collection('configs');

    // Stores the current logging and moderation configurations
    const logging = await configs.findOne({ docType: 'logging' });
    const moderation = await configs.findOne({ docType: 'moderation' });

    // Stores the previous settings of the reports record
    const memberReports = logging && logging.memberReports ? logging.memberReports : {};

    // Stores whether the reports were enabled (they needed both the setting of the moderation module and the record)
    const enabled = !!(moderation && moderation.allowMemberReports) && !!memberReports.enabled;

    // Stores the channel where they were sent (its own one, or the default one of the records if they were being sent there)
    const channelId = memberReports.channelId || (enabled && logging && logging.defaultChannelId) || '';

    // If there is a moderation configuration, moves the settings to it (otherwise, it will be generated with the default values)
    if (moderation) await configs.updateOne({ docType: 'moderation' }, {
        $set: { reports: { enabled: enabled && channelId.length > 0, channelId: channelId, mentionRoles: [] } },
        $unset: { allowMemberReports: '' }
    });

    // If there is a logging configuration, deletes the old record from it
    if (logging) await configs.updateOne({ docType: 'logging' }, { $unset: { memberReports: '' } });
};

// Restores the previous settings
export async function down(db) {

    // Stores the collection of the configurations
    const configs = db.collection('configs');

    // Stores the current moderation configuration, and the settings of the reports
    const moderation = await configs.findOne({ docType: 'moderation' });
    const reports = moderation && moderation.reports ? moderation.reports : {};

    // Restores the setting of the moderation module
    if (moderation) await configs.updateOne({ docType: 'moderation' }, {
        $set: { allowMemberReports: !!reports.enabled },
        $unset: { reports: '' }
    });

    // Restores the reports record
    await configs.updateOne({ docType: 'logging' }, { $set: { memberReports: { enabled: !!reports.enabled, channelId: reports.channelId || '' } } });
};
