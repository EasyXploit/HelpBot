// Function to check if a member can sanction another one, which returns the reason if not ("badHierarchy" or "badBotHierarchy"), or nothing if it can
export default (executorMember, targetMember) => {

    // If the executor is not the owner of the guild, and its highest role is not above the one of the target, it can not sanction it
    if (executorMember.id !== executorMember.guild.ownerId && executorMember.roles.highest.position <= targetMember.roles.highest.position) return 'badHierarchy';

    // If the highest role of the bot is not above the one of the target, it can not sanction it
    if (targetMember.guild.members.me.roles.highest.position <= targetMember.roles.highest.position) return 'badBotHierarchy';

    // Returns nothing, as it can sanction it
    return null;
};
