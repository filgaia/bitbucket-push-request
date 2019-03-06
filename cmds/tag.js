// @vendors
const ora = require('ora');
const chalk = require('chalk');
// @utils
const getTag = require('../utils/tag');
const error = require('../utils/error');
// @services
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const getTitle = () => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Tag creation:`));
    console.log(chalk.cyanBright(`=============`));
};

module.exports = async (args) => {
    let spinner = ora();

    const remote = args.remote || args.r || config.remote;
    const destination = args.dest || args.d || config.destination;
    let tag = args.tag || args.t;

    getTitle();
    spinner.start();

    try {
        tag = await getTag({
            destination,
            remote,
            spinner,
            tag
        });

        if (tag) {
            await getMessage({
                tag,
                repository: remote
            });
        }

        spinner.stop();
    } catch (response) {
        error(response, true, spinner);
    }

    console.log(`Operation Completed!!!`);
};
