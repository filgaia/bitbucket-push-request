// @vendors
const ora = require('ora');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const error = require('../utils/error');
const help = require('../utils/help');
const getTag = require('../utils/tag');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (args) => {
    let spinner = ora();

    try {
        const remote = args.remote || args.r || 'upstream';
        const jira = args.jira || args.j;
        const message = args.message || args.m;
        const forked = (args.p || args.parent) !== 'true';
        const tagDestination = args.t || args.tagDestination || config.destination;
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

        const errorHandler = (err) => {
            if (err) {
                error(err, true, spinner);
            }
        };

        const finish = async (err) => {

            errorHandler(err, true, spinner);

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

        const tagHandler = (err) => {
            // Don't stop if error with the tag
            if (err) {
                error(err, false);
            }

            console.log(`Creating push for branch ${origin}`);

            git.push(['-u', config.remote, origin], { '--no-verify': null, '--force': null }, finish);
        }

        const branchHandler = (err, summary) => {
            origin = get(summary, 'current');

            if (origin === destination) {
                error(`Origin cannot be the same as destination`, true, spinner);
            }

            // if we are doing a parent request we check the tag and create it if needed.
            if (!forked) {
                console.log('Checking the tag...');

                getTag({
                    destination: tagDestination,
                    finish: tagHandler,
                    git: simpleGit(config.gitPath),
                    path: config.gitPath,
                    remote,
                    errorHandler
                });
            }

            tagHandler();
        }

        git.branchLocal(branchHandler);
    } catch (err) {
        error(err, true, spinner);
    }
}