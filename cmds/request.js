// @vendors
const ora = require('ora');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const error = require('../utils/error');
const getTag = require('../utils/tag');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (args) => {
    let spinner = ora();

    try {
        const location = args.location || args.l || 'upstream';
        const parent = !!args.hasOwnProperty('parent');
        const checkTag = !args.hasOwnProperty('tag');
        const verify = !args.hasOwnProperty('verify');
        const notify = !args.hasOwnProperty('notify');
        const tagDestination = args.t || args['tag-destination'] || config.destination;
        let repository = args.r || args.repo;
        let destination = args.dest || args.d;
        let pushOptions = { '--force': null };

        const gitDir = parent ? config.parentPath : config.gitPath;

        if (isUndefined(repository)) {
            repository = parent ? config.parentRepo : config.repository;
        }

        if (isUndefined(destination)) {
            destination = parent ? config.parentDestination : config.destination;
        }

        if (!verify) {
            pushOptions['--no-verify'] = null;
        }

        const git = simpleGit(gitDir);

        let jira;
        let message;
        let origin = '';

        console.log(`\n`);
        console.log(chalk.cyanBright(`Creating pull-request in ${repository}:`));
        console.log(chalk.cyanBright(`=================================`));

        spinner.start();

        // Get the last commit info
        git.log(['-1', '--format=%s'], (err, log) => {
            const logMessage = get(log, 'latest.hash', '').split(' - ');

            jira = logMessage[0].trim();
            message = logMessage[1].trim();

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
                        forked: !parent
                    });

                    if (notify) {
                        console.log(`Calling the Slack for PR #${response.id}...`);

                        await getMessage({
                            jira,
                            repository,
                            id: response.id
                        });
                    }

                    spinner.stop();

                    console.log(`Operation Completed!!!`);
                } catch (err) {
                    error(err, true, spinner);
                }
            };

            const tagHandler = (err) => {
                // Don't stop if error with the tag
                if (err) {
                    error(get(err, 'error', false));
                }

                console.log(`Creating push for branch ${origin}`);

                git.outputHandler((command, stdout, stderr) => {
                    stdout.pipe(process.stdout);
                    stderr.pipe(process.stderr);
                }).push(['-u', config.remote, origin], pushOptions, finish);
            }

            const branchHandler = (err, summary) => {
                origin = get(summary, 'current');

                if (origin === destination) {
                    error(`Origin cannot be the same as destination`, true, spinner);
                }

                // if we are doing a parent request we check the tag and create it if needed.
                if (parent && checkTag) {
                    console.log('Checking the tag...');

                    getTag({
                        destination: tagDestination,
                        finish: tagHandler,
                        git: simpleGit(config.gitPath),
                        path: config.gitPath,
                        remote: location,
                        errorHandler
                    });
                } else {
                    tagHandler();
                }
            }

            git.branchLocal(branchHandler);
        });
    } catch (err) {
        error(err, true, spinner);
    }
}