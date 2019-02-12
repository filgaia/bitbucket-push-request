// @vendors
const ora = require('ora');
const chalk = require('chalk');
// @services
const getMessage = require('../services/hook');

module.exports = async (args) => {
    const text = args.message || args.m || 'Hello World from the app!!';
    const jira = args.jira || args.j;
    const repository = args.r || args.repo;
    const id = args.id || args.i;

    const spinner = ora().start();

    try {
        console.log(`\n`);
        console.log(chalk.cyanBright(`Testing communication with Slack:`));
        console.log(chalk.cyanBright(`================================`));

        await getMessage({
            text,
            jira,
            repository,
            id
        });

        spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        spinner.stop();

        console.error(err);
    }
}