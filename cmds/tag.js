// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getTag = require('../utils/tag');
const getMessage = require('../utils/hook');
const error = require('../utils/error');
const help = require('../utils/help');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = ora();

    try {
        const name = args.name || args.n;
        const remote = args.remote || args.r || config.remote;

        // Error exit
        if (!name || !remote) {
            console.log(help['tag']);

            error(`Not all required params where given!`, true);
        }

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Tag creation:`));
        console.log(chalk.cyanBright(`=============`));

        spinner.start();

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