// @vendors
const ora = require('ora');
const getForks = require('../utils/forks');
const get = require('lodash/get');
const chalk = require('chalk');

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