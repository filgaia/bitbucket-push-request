// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getMessage = require('../utils/hook');
const setPullRequest = require('../utils/request');
const getLibFile = require('../utils/lib-update');
const error = require('../utils/error');
const help = require('../utils/help');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const jira = args.jira || args.j;
        const type = args.type || args.t || config.parentType;
        const destination = args.dest || args.d || config.parentDestination;
        const branch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;
        const repository = config.parentRepo;
        const path = config.parentPath;
        const message = `Update ${config.repository} version`;

        // Error exit
        if (!version || !jira) {
            console.log(help['lib-update']);

            error(`Not all required params where given!`, true);
        }

        const git = simpleGit(path);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Library update:`));
        console.log(chalk.cyanBright(`===============`));

        spinner.start();

        const handler = async (error) => {
            console.log(`- Pushed files..............`);

            try {
                // Pull Request
                const response = await setPullRequest({
                    message,
                    destination,
                    repository,
                    jira,
                    origin: branch,
                    forked: false
                });

                console.log(`Calling the Slack for PR #${response.id}...`);

                const slackMessage = `A new *PR* for <${config.jira}${jira}|${jira}> by *${config.auth.username}* have been created!`
                const attachments = [
                    {
                        color: 'good',
                        title: `Merge Request #${response.id} - ${repository}`,
                        title_link: `${config.url}/projects/${config.project}/repos/${repository}/pull-requests/${response.id}/overview`
                    }
                ];

                await getMessage(slackMessage, attachments);

                // Slack Notification

                spinner.stop();

                if (error) {
                    error(get(error, 'error'), true);
                }

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
        }

        getLibFile({
            finish: handler,
            branch,
            git,
            jira,
            message,
            path,
            type,
            version
        });
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