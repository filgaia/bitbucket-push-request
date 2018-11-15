// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const setPullRequest = require('../utils/pull-request');
const getMessage = require('../utils/hook');
const getFile = require('../utils/version-update');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = null;

    try {
        const jira = args.jira || args.j;
        const message = args.message || args.m;
        const dest = args.dest || args.d;
        const version = args.newVersion || args.n;

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        let commitHash = null;

        // Handlers
        const branchLocalHandler = (error, summary) => {
            if (summary.branches[jira]) {
                git.deleteLocalBranch(jira, () => console.log(`- Deleted local branch ${jira}...`))
                    .checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                    .add('./*', () => console.log(`- Added the files..............`))
                    .commit(`${jira} - ${message}`, commitHandler);
            } else {
                git.checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                    .add('./*', () => console.log(`- Added the files..............`))
                    .commit(`${jira} - ${message}`, commitHandler);
            }
        }

        const commitHandler = (error, response) => {
            console.log(`- Committed files..............`);

            commitHash = get(response, 'commit');

            getFile({
                finish,
                git,
                jira,
                newBranch: false,
                push: !!jira,
                version
            });
        };

        const finish = async () => {
            console.log(`- Pushed changes..............`);

            const response = await setPullRequest({
                dest,
                jira,
                message,
                origin: jira
            });

            console.log(`Calling the Slack for PR #${response.id}...`);

            const slackMessage = `A new *PR* for <${config.jira}${jira}|${jira}> by *${config.auth.username}* have been created!`
            const attachments = [
                {
                    color: 'good',
                    title: `Merge Request #${response.id} - ${config.repository}`,
                    title_link: `${config.url}/projects/${config.project}/repos/${config.repository}/pull-requests/${response.id}/overview`
                }
            ];

            await getMessage(slackMessage, attachments);

            spinner.stop();

            console.log(`Operation Completed!!!`);
        };

        console.log(`\n`);
        console.log(chalk.cyanBright(`Creating a full push:`));
        console.log(chalk.cyanBright(`=====================`));

        spinner = ora().start();

        git.branchLocal(branchLocalHandler);
    } catch (err) {
        spinner.stop();

        console.log(chalk.red(`Errors:`));
        console.log(chalk.red(`=======`));

        const data = get(err, 'response.data.errors');

        if (data) {
            data.forEach((i) => {
                console.log(get(i, 'message'));
            });
        }
        else {
            console.error(err);
        }
    }
}