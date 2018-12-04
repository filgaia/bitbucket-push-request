// @vendors
const ora = require('ora');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const error = require('../utils/error');
const help = require('../utils/help');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (args) => {
    let spinner = ora();

    try {
        const jira = args.jira || args.j;
        const message = args.message || args.m;
        const forked = (args.p || args.parent) !== 'true';
        let repository = args.r || args.repo;
        let destination = args.dest || args.d;

        const gitDir = forked ? config.gitPath : config.parentPath;

        if (isUndefined(repository)) {
            repository = forked ? config.repository : config.parentRepo;
        }

        if (isUndefined(destination)) {
            destination = forked ? config.destination : config.parentDestination
        }

        const git = simpleGit(gitDir);

        let origin = '';

        // Error exit
        if (!jira || !message) {
            console.log(help['request']);

            error(`Not all required params where given!`, true);
        }

        console.log(`\n`);
        console.log(chalk.cyanBright(`Creating pull-request in ${repository}:`));
        console.log(chalk.cyanBright(`=================================`));

        spinner.start();

        const finish = async (err) => {

            if (err) {
                error(err, true, spinner);
            }

            console.log(`Creating pull-request for branch ${origin}`);

            try {
                const response = await setPullRequest({
                    destination,
                    jira,
                    message,
                    origin,
                    repository,
                    forked
                });

                console.log(`Calling the Slack for PR #${response.id}...`);

                const slackMessage = `A new *PR* for <${config.jira}${jira}|${jira}> have been created!`
                const attachments = [
                    {
                        color: 'good',
                        footer: config.auth.username,
                        title: `PR ${repository} #${response.id} - ${jira}`,
                        title_link: `${config.url}/projects/${config.project}/repos/${repository}/pull-requests/${response.id}/overview`
                    }
                ];

                await getMessage(slackMessage, attachments);

                spinner.stop();

                console.log(`Operation Completed!!!`);
            } catch (err) {
                error(err, true, spinner);
            }
        };

        const branchHandler = (err, summary) => {
            origin = get(summary, 'current');

            if (origin === destination) {
                spinner.stop();

                error(`Origin cannot be the same as destination`, true);
            }

            console.log(`Creating push for branch ${origin}`);

            git.push(['-u', config.remote, origin], { '--no-verify': null, '--force': null }, finish);
        }

        git.branchLocal(branchHandler);
    } catch (err) {
        error(err, true, spinner);
    }
}