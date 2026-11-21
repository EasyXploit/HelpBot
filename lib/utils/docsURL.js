// Function to obtain the URL of the bot documentation (or of one of its pages), in the branch of the running version
export default (page) => {

    // Stores the branch from which the Docker image was built
    let branch = process.env.HELPBOT_BRANCH;

    // If the bot does not run from the Docker image, tries to obtain the branch from the Git repository
    if (!branch) {

        try {

            // Reads the reference of the current branch (for example, "ref: refs/heads/beta")
            const head = fs.readFileSync('./.git/HEAD', 'utf8').trim();

            // Stores the name of the branch, if the repository is on one
            if (head.startsWith('ref: refs/heads/')) branch = head.replace('ref: refs/heads/', '');

        } catch (error) {

            // If there is no Git repository, uses the beta branch if beta updates are enabled
            try { if (require('./config.json').betaEnabled) branch = 'beta'; } catch (error) {};
        };
    };

    // Only the stable and beta branches have published documentation, so any other branch uses the stable one
    if (branch !== 'beta') branch = 'master';

    // Returns the URL of the page, or the URL of the documentation folder if no page was provided
    return page ? `https://github.com/EasyXploit/HelpBot/blob/${branch}/docs/${page}` : `https://github.com/EasyXploit/HelpBot/tree/${branch}/docs`;
};
