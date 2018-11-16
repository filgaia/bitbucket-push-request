// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getTag = require('../utils/tag');
const getMessage = require('../utils/hook');
const error = require('../utils/error');
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

        console.log(`\n`);
        console.log(chalk.cyanBright(`Tag creation:`));
        console.log(chalk.cyanBright(`=============`));

        spinner.start();

        const errorHandler = (err) => {
            if (err) {
                spinner.stop();
                error(err, true);
            }
        };

        const handler = async (error) => {
            spinner.stop();

            if (error) {
                error(error.error, true);
            } else {

                const slackMessage = `A new *Tag* for *${config.repository} (${remote})* have been created!`
                const attachments = [
                    {
                        footer: config.auth.username,
                        color: 'good',
                        title: `${name}`
                    }
                ];

                await getMessage(slackMessage, attachments);
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