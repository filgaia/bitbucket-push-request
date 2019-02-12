// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getFile = require('../utils/version-update');
const getLibFile = require('../utils/lib-update');
// @services
const getMessage = require('../services/hook');
const setPullRequest = require('../services/request');
// @config
const config = require(appRoot + '/bb-pr-config.json');
const error = require('../utils/error');
const help = require('../utils/help');

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const type = args.type || args.t || config.parentType;
        const destination = args.dest || args.d || config.destination;
        const parentDestination = args.parentDestination || args.pd || config.parentDestination;
        const path = config.gitPath;
        const parentPath = config.parentPath;
        const attachments = [];

        let jira;
        let message;

        // Error exit
        if (!version) {
            console.log(help['full']);

            error(`Not all required params where given!`, true);
        }

        const git = simpleGit(path);
        const gitParent = simpleGit(parentPath);

        // Get the last commit info
        git.log(['-1', '--format=%s'], (err, log) => {
            const logMessage = get(log, 'latest.hash', '').split(' - ');

            jira = logMessage[0].trim();
            message = logMessage[1].trim();

            const parentBranch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;

            // TODO: Include for cherry-pick
            // let commitHash = null;

            // Handlers
            const branchLocalHandler = (error, summary) => {
                if (summary.branches[jira]) {
                    git.branch(['-D', jira], () => console.log(`- Deleted local branch ${jira}...`))
                        .checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                        .add('./*', () => console.log(`- Added the files..............`))
                        .commit(`${jira} - ${message}`, commitHandler);
                } else {
                    git.checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                        .add('./*', () => console.log(`- Added the files..............`))
                        .commit(`${jira} - ${message}`, commitHandler);
                }
            }

            const commitHandler = (err) => {

                if (err) {
                    error(err, true, spinner);
                }

                console.log(`- Committed files..............`);

                // TODO: Include for cherry-pick
                // commitHash = get(response, 'commit');

                getFile({
                    finish: finishRepository,
                    git,
                    jira,
                    newBranch: false,
                    path,
                    push: !!jira,
                    version
                });
            };

            const finish = async (dest, origin, repository, forked) => {
                console.log(`- Pushed changes ${repository}..............`);

                try {
                    const response = await setPullRequest({
                        destination: dest,
                        jira,
                        message,
                        origin,
                        repository,
                        forked
                    });

                    if (parentPath && attachments.length === 2) {
                        console.log(`Calling the Slack for PRs.....`);

                        await getMessage({
                            jira,
                            repository,
                            id: response.id
                        });

                        spinner.stop();

                        console.log(`Operation Completed!!!`);
                    } else if (!parentPath) {
                        console.log(`Calling the Slack for PRs.....`);

                        await getMessage({
                            jira,
                            repository,
                            id: response.id
                        });

                        spinner.stop();

                        console.log(`Operation Completed!!!`);
                    }
                } catch (err) {
                    error(err, true, spinner);
                }
            };

            const finishRepository = () => {
                finish(destination, jira, config.repository, true);
            };

            const finishParent = () => {
                finish(parentDestination, parentBranch, config.parentRepo, false);
            };

            console.log(`\n`);
            console.log(chalk.cyanBright(`Creating a full push:`));
            console.log(chalk.cyanBright(`=====================`));

            spinner.start();

            // Updating the changes for repository
            git.branchLocal(branchLocalHandler);

            // Updating the changes for parent
            if (parentPath) {
                getLibFile({
                    finish: finishParent,
                    branch: parentBranch,
                    git: gitParent,
                    jira,
                    message,
                    path: parentPath,
                    type,
                    version
                });
            }
        });
    } catch (err) {
        error(err, true, spinner);
    }
}