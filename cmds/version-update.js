// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getFile = require('../utils/version-update');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = null;

    try {
        const version = args.newVersion || args.n;
        const path = args.path || args.p;
        const jira = args.jira || args.j;

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Version update:`));
        console.log(chalk.cyanBright(`===============`));

        spinner = ora().start();

        const handler = () => {
            console.log(`- Pushed files..............`);

            spinner.stop();

            console.log(`Operation Completed!!!`);
        }

        getFile({
            finish: handler,
            git,
            jira,
            newBranch: true,
            path,
            push: !!jira,
            version
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