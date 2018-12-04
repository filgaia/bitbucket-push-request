// @vendors
const ora = require('ora');
const getForks = require('../services/forks');
const get = require('lodash/get');
const chalk = require('chalk');
// @utils
const error = require('../utils/error');

module.exports = async () => {
    const spinner = ora().start();

    try {
        const forks = await getForks();

        spinner.stop();
        console.log(`\n`);
        console.log(chalk.cyanBright(`Current forks in ok-loans:`));
        console.log(chalk.cyanBright(`==========================`));

        forks.forEach((fork) => {
            console.log(get(fork, 'project.key'));
        });
    } catch (err) {
        error(err, true, spinner);
    }
}