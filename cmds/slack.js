// @vendors
const ora = require('ora');
const chalk = require('chalk');
const simpleGit = require('simple-git/promise');
const get = require('lodash/get');
// @services
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const getCommit = async (parent, id, spinner) => {
    let jira;
    let repository;

    repository = parent ? config.parentRepo : config.repository;

    const gitDir = parent ? config.parentPath : config.gitPath;

    try {
        const git = simpleGit(gitDir);

        const log = await git.log(['-1', '--format=%s']);
        const logMessage = get(log, 'latest.hash', '').split(' - ');

        jira = get(logMessage, '0', '').trim();

        await getMessage({
            jira,
            repository,
            id
        });
    } catch (err) {
        spinner.stop();

        console.error(err);
    }
};

const getTitle = () => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Testing communication with Slack:`));
    console.log(chalk.cyanBright(`================================`));
};

module.exports = async (args) => {
    const text = args.message || args.m || 'Hello World from the app!!';
    const parent = !!args.hasOwnProperty('parent');
    const id = args.id || args.i;
    const spinner = ora();

    try {
        spinner.start();
        getTitle();

        if (id) {
            await getCommit(parent, id, spinner);
        } else {
            await getMessage({ text });
        }

        spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        spinner.stop();
        console.error(err);
    }
};
