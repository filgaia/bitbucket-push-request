// @vendors
const ora = require('ora');
const getForks = require('../services/forks');
const get = require('lodash/get');
const chalk = require('chalk');
// @utils
const error = require('../utils/error');

module.exports = async () => {
    const spinner = ora();

    try {
        console.log(`\n`);
        console.log(chalk.cyanBright(`Current forks in ok-loans:`));
        console.log(chalk.cyanBright(`==========================`));

        spinner.start();

        const forks = await getForks();

        spinner.stop();

        forks.forEach((fork) => {
            console.log(get(fork, 'project.key'));
        });
    } catch (err) {
        error(err, true, spinner);
    }
};
