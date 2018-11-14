const ora = require('ora');
const getForks = require('../utils/forks');
const get = require('lodash/get');

module.exports = async () => {
    const spinner = ora().start();

    try {
        const forks = await getForks();

        spinner.stop();
        console.log(`\n`);
        console.log(`Current forks in ok-loans:`);
        console.log(`==========================`);

        forks.forEach((fork) => {
            console.log(get(fork, 'project.key'));
        });
    } catch (err) {
        spinner.stop();

        console.error(err);
    }
}