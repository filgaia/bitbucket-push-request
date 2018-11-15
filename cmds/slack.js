// @vendors
const ora = require('ora');
const getMessage = require('../utils/hook');
const chalk = require('chalk');

module.exports = async (args) => {
    const message = args.message || args.m || 'Hello World from the app!!';
    const spinner = ora().start();

    try {
        console.log(`\n`);
        console.log(chalk.cyanBright(`Testing communication with Slack:`));
        console.log(chalk.cyanBright(`================================`));

        await getMessage(message);

        spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        spinner.stop();

        console.error(err);
    }
}