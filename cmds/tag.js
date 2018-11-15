// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getTag = require('../utils/tag');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = null;

    try {
        const name = args.name || args.n;
        const remote = args.remote || args.r;

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Tag creation:`));
        console.log(chalk.cyanBright(`=============`));

        spinner = ora().start();

        const handler = () => {
            spinner.stop();

            console.log(`Operation Completed!!!`);
        }

        getTag({
            finish: handler,
            git,
            name,
            remote
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