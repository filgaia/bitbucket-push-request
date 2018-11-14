// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const setPullRequest = require('../utils/pull-request');
const getMessage = require('../utils/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = null;

    try {
        const jira = args.jira || args.j;
        const message = args.message || args.m;
        const dest = args.dest || args.d;

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        let commitHash = null;

        // Handlers
        const pushHandler = async (error, resp) => {
            console.log(`- Pulling Request..............`);

            spinner = ora().start();

            try {
                const response = await setPullRequest({
                    dest,
                    jira,
                    message,
                    origin: jira
                });

                spinner.stop();

                console.log(`Calling the Slack for PR #${response.id}...`);

                const slackMessage = `A new *Pull Request* created by *${config.auth.username}* have been created!`
                const attachments = [
                    {
                        color: 'good',
                        title: `Merge Request #${response.id} - ${jira}`,
                        title_link: `${config.url}/projects/${config.project}/repos/${config.repository}/pull-requests/${response.id}/overview`
                    }
                ];

                spinner = ora().start();

                await getMessage(slackMessage, attachments);

                spinner.stop();

                console.log(`Operation Completed!!!`);
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
        };

        const branchLocalHandler = (error, summary) => {
            if (summary.branches[jira]) {
                git.deleteLocalBranch(jira);
            }

            git.checkoutLocalBranch(jira)
                .add('./*')
                .commit(`${jira} - ${message}`, commitHandler)
                .push(['-u', 'origin', jira], { '--no-verify': null, '--force': null }, pushHandler);
        }

        const commitHandler = (error, response) => {
            commitHash = get(response, 'commit');
        };

        console.log(`\n`);
        console.log(chalk.cyanBright(`Creating a full push:`));
        console.log(chalk.cyanBright(`=====================`));

        console.log(`- Deleting local branch ${jira}...`);
        console.log(`- Checking out branch ${jira}...`);
        console.log(`- Adding the files..............`);
        console.log(`- Commiting files..............`);
        console.log(`- Pushing files..............`);

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