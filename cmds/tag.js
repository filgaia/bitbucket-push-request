// @vendors
const ora = require('ora');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getTag = require('../utils/tag');
const error = require('../utils/error');
// @services
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = ora();

    try {
        const remote = args.remote || args.r || 'upstream';
        const destination = args.dest || args.d || config.destination;
        const path = config.gitPath;

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        const filename = `../${path}/package.json`;
        const file = require(filename);
        const tag = file.version;

        console.log(`\n`);
        console.log(chalk.cyanBright(`Tag creation:`));
        console.log(chalk.cyanBright(`=============`));

        spinner.start();

        const errorHandler = (err) => {
            if (err) {
                error(err, true, spinner);
            }
        };

        const handler = async (err) => {
            spinner.stop();

            if (err) {
                error(err.error, true);
            } else {
                await getMessage({
                    tag,
                    repository: remote
                });
            }

            console.log(`Operation Completed!!!`);
        }

        getTag({
            destination,
            finish: handler,
            git,
            path,
            remote,
            errorHandler
        });
    } catch (err) {
        error(err, true, spinner);
    }
}