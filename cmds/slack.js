// @vendors
const ora = require('ora');
const chalk = require('chalk');
const simpleGit = require('simple-git');
const get = require('lodash/get');
// @services
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (args) => {
    const text = args.message || args.m || 'Hello World from the app!!';
    const parent = !!args.hasOwnProperty('parent');
    const id = args.id || args.i;
    let jira;
    let repository;

    const spinner = ora().start();

    try {
        console.log(`\n`);
        console.log(chalk.cyanBright(`Testing communication with Slack:`));
        console.log(chalk.cyanBright(`================================`));

        if (id) {
            repository = parent ? config.parentRepo : config.repository;

            const gitDir = parent ? config.parentPath : config.gitPath;
            const git = simpleGit(gitDir);

            git.log(['-1', '--format=%s'], (err, log) => {
                const logMessage = get(log, 'latest.hash', '').split(' - ');

                jira = logMessage[0].trim();

                getMessage({
                    jira,
                    repository,
                    id
                });
            });
        } else {
            await getMessage({
                text
            });
        }

        spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        spinner.stop();

        console.error(err);
    }
}