// Function to check if a member can sanction another one, which returns the reason if not ("badHierarchy" or "badBotHierarchy"), or nothing if it can
export default (executorMember, targetMember, { checkBot = true } = {}) => {

    // Stores if the executor and the target are the owner of the guild
    const executorIsOwner = executorMember.id === executorMember.guild.ownerId;
    const targetIsOwner = targetMember.id === targetMember.guild.ownerId;

    // If the executor is not the owner of the guild, it can not sanction the owner, nor a member whose highest role is not below its own
    if (!executorIsOwner && (targetIsOwner || executorMember.roles.highest.position <= targetMember.roles.highest.position)) return 'badHierarchy';

    // If the bot has to apply the sanction, it can not do it to the owner of the guild, nor to a member whose highest role is not below its own
    if (checkBot && (targetIsOwner || targetMember.guild.members.me.roles.highest.position <= targetMember.roles.highest.position)) return 'badBotHierarchy';

    // Returns nothing, as it can sanction it
    return null;
};
