// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getLibFile = require('../utils/lib-update');
const error = require('../utils/error');
const help = require('../utils/help');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const jira = args.jira || args.j;
        const type = args.type || args.t || config.parentType;
        const destination = args.dest || args.d || config.parentDestination;
        const branch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;
        const repository = config.parentRepo;
        const path = config.parentPath;
        const message = `Update ${config.repository} version`;

        // Error exit
        if (!version || !jira) {
            console.log(help['lib-update']);

            error(`Not all required params where given!`, true);
        }

        const git = simpleGit(path);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Library update:`));
        console.log(chalk.cyanBright(`===============`));

        spinner.start();

        const handler = async (error) => {
            console.log(`- Pushed files..............`);

            try {
                // Pull Request
                const response = await setPullRequest({
                    message,
                    destination,
                    repository,
                    jira,
                    origin: branch,
                    forked: false
                });

                console.log(`Calling the Slack for PR #${response.id}...`);

                await getMessage({
                    jira,
                    repository,
                    id: response.id
                });

                // Slack Notification

                spinner.stop();

                if (error) {
                    error(get(error, 'error'), true);
                }

                console.log(`Operation Completed!!!`);
            } catch (err) {
                error(err, true, spinner);
            }
        }

        getLibFile({
            finish: handler,
            branch,
            git,
            jira,
            message,
            path,
            type,
            version
        });
    } catch (err) {
        error(err, true, spinner);
    }
}