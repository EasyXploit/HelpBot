// Imports the necessary libraries
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import * as tar from 'tar';

// Stores the folder of the bot (two levels above this file)
const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Paths of the bot folder that an update never replaces nor deletes, as they belong to this installation (its configuration, data, logs and dependencies)
const preservedPaths = ['config.json', '.env', 'data', 'logs', 'state', 'node_modules', '.git', '.devcontainer/data'];

// Folders whose files are deleted when they no longer exist in the new version, so no remains of the old code are left
const codeFolders = ['lib', 'handlers', 'locales', 'models', 'migrations'];

// Function to know if a path (relative to the bot folder, with "/" as separator) must be preserved
function isPreserved(relativePath) {
    return preservedPaths.some(preservedPath => relativePath === preservedPath || relativePath.startsWith(`${preservedPath}/`));
};

// Function to list the files of a folder (relative to it, with "/" as separator), without entering the preserved paths
async function listFiles(rootDirectory, currentDirectory = rootDirectory) {

    // Stores the files found
    let files = [];

    // For each entry of the folder
    for (const entry of await fs.promises.readdir(currentDirectory, { withFileTypes: true })) {

        // Stores its path, and its path relative to the root folder
        const entryPath = path.join(currentDirectory, entry.name);
        const relativePath = path.relative(rootDirectory, entryPath).split(path.sep).join('/');

        // Skips it if it must be preserved
        if (isPreserved(relativePath)) continue;

        // Lowers a level if it is a folder, or adds it if it is a file
        if (entry.isDirectory()) files = files.concat(await listFiles(rootDirectory, entryPath));
        else if (entry.isFile()) files.push(relativePath);
    };

    // Returns the files found
    return files;
};

// Function to install the dependencies of the bot, keeping the development ones only outside production
function installDependencies() {

    // Returns a promise that is resolved when npm finishes
    return new Promise((resolve, reject) => {

        // Runs "npm ci" in the bot folder (Windows needs a shell to run npm)
        const npmProcess = spawn('npm', ['ci', ...(process.env.NODE_ENV === 'production' ? ['--omit=dev'] : [])], { cwd: appDirectory, stdio: 'inherit', shell: process.platform === 'win32' });

        // Resolves or rejects the promise depending on how npm finished
        npmProcess.on('error', reject);
        npmProcess.on('close', exitCode => exitCode === 0 ? resolve() : reject(new Error(`npm ci finished with the exit code ${exitCode}`)));
    });
};

// Exports a function that downloads a release of the bot from GitHub and installs it over the current version, restoring the previous files if something fails
export default async function installRelease({ tarballUrl, userAgent, tempDirectory }) {

    // Stores the working folders: one for the new version and one for the backup of the files that are replaced or deleted
    const releaseDirectory = path.join(tempDirectory, 'release');
    const backupDirectory = path.join(tempDirectory, 'backup');

    // Creates them empty
    await fs.promises.rm(tempDirectory, { recursive: true, force: true });
    await fs.promises.mkdir(releaseDirectory, { recursive: true });
    await fs.promises.mkdir(backupDirectory, { recursive: true });

    // Downloads the package of the release
    logger.debug(`Downloading the release package from ${tarballUrl} ...`);
    const response = await fetch(tarballUrl, { headers: { 'User-Agent': userAgent, 'Accept': 'application/vnd.github+json' } });
    if (!response.ok || !response.body) throw new Error(`The release package could not be downloaded (status code ${response.status})`);
    const archivePath = path.join(tempDirectory, 'release.tar.gz');
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(archivePath));

    // Extracts it, removing its first folder (named after the repository and the commit)
    await tar.x({ file: archivePath, cwd: releaseDirectory, strip: 1 });

    // Stores the files of the new version, and the ones of the current version
    const newFiles = await listFiles(releaseDirectory);
    const currentFiles = await listFiles(appDirectory);

    // Returns an error if the package does not look like the bot (so the bot folder is not modified)
    if (!newFiles.includes('package.json') || !newFiles.includes('index.js')) throw new Error('The release package does not contain the bot');

    // Stores the files of the code folders that no longer exist in the new version
    const newFilesSet = new Set(newFiles);
    const filesToDelete = currentFiles.filter(file => codeFolders.includes(file.split('/')[0]) && !newFilesSet.has(file));

    // Stores whether the dependencies have changed, comparing both lockfiles
    const readIfExists = async filePath => fs.promises.readFile(filePath, 'utf8').catch(() => null);
    const dependenciesChanged = await readIfExists(path.join(appDirectory, 'package-lock.json')) !== await readIfExists(path.join(releaseDirectory, 'package-lock.json'));

    // Stores the changes made, to undo them if something fails: the files that were backed up and the files that did not exist before
    const backedUpFiles = [];
    const createdFiles = [];

    try {

        // For each file that is going to be replaced or deleted, makes a backup of it if it exists
        for (const file of [...newFiles, ...filesToDelete]) {

            // Stores its current path
            const currentPath = path.join(appDirectory, file);

            // If it exists, copies it to the backup folder; if not, records that it is going to be created
            if (fs.existsSync(currentPath)) {
                await fs.promises.mkdir(path.dirname(path.join(backupDirectory, file)), { recursive: true });
                await fs.promises.copyFile(currentPath, path.join(backupDirectory, file));
                backedUpFiles.push(file);
            } else if (newFilesSet.has(file)) {
                createdFiles.push(file);
            };
        };

        // Copies the files of the new version over the bot folder
        logger.debug(`Copying ${newFiles.length} files of the new version, and deleting ${filesToDelete.length} that no longer exist ...`);
        for (const file of newFiles) {
            await fs.promises.mkdir(path.dirname(path.join(appDirectory, file)), { recursive: true });
            await fs.promises.copyFile(path.join(releaseDirectory, file), path.join(appDirectory, file));
        };

        // Deletes the files of the code folders that no longer exist
        for (const file of filesToDelete) await fs.promises.rm(path.join(appDirectory, file), { force: true });

        // Installs the dependencies, if they have changed
        if (dependenciesChanged) {
            logger.debug('The dependencies have changed, so they are going to be installed ...');
            await installDependencies();
        };

    } catch (error) {

        // Logs that the previous version is going to be restored
        logger.error(`The update could not be installed, so the previous version is going to be restored: ${error.stack}`);

        // Deletes the files that did not exist before, and restores the ones that were backed up
        for (const file of createdFiles) await fs.promises.rm(path.join(appDirectory, file), { force: true });
        for (const file of backedUpFiles) {
            await fs.promises.mkdir(path.dirname(path.join(appDirectory, file)), { recursive: true });
            await fs.promises.copyFile(path.join(backupDirectory, file), path.join(appDirectory, file));
        };

        // If the dependencies were being installed, installs the previous ones again
        if (dependenciesChanged) await installDependencies().catch(installError => logger.error(`The previous dependencies could not be installed again: ${installError.stack}`));

        // Throws the error again, so the menu shows it
        throw error;

    } finally {

        // Removes the working folders
        await fs.promises.rm(tempDirectory, { recursive: true, force: true }).catch(() => {});
    };
};
