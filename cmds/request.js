// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
// @utils
const setPullRequest = require('../utils/request');
const getMessage = require('../utils/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');
const error = require('../utils/error');
const help = require('../utils/help');

module.exports = async (args) => {
    let spinner = ora();

    try {
        const jira = args.jira || args.j;
        const message = args.message || args.m;
        const destination = args.dest || args.d || config.destination;
        const origin = args.origin || args.o || jira;

        // Error exit
        if (!jira || !message || !destination) {
            console.log(help['request']);

            error(`Not all required params where given!`, true);
        }

        console.log(`\n`);
        console.log(chalk.cyanBright(`Creating pull-request in ${config.repository}:`));
        console.log(chalk.cyanBright(`=================================`));

        spinner.start();

        const response = await setPullRequest({
            destination,
            jira,
            message,
            origin,
            forked: true
        });

        console.log(`Calling the Slack for PR #${response.id}...`);

        const slackMessage = `A new *PR* for <${config.jira}${jira}|${jira}> have been created!`
        const attachments = [
            {
                color: 'good',
                footer: config.auth.username,
                title: `Merge Request #${response.id} - ${jira}`,
                title_link: `${config.url}/projects/${config.project}/repos/${config.repository}/pull-requests/${response.id}/overview`
            }
        ];

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
}