// @vendors
const ora = require('ora');
const chalk = require('chalk');
const simpleGit = require('simple-git');
// @utils
const getFile = require('../utils/version-update');
const error = require('../utils/error')
const help = require('../utils/help');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const path = args.path || args.p || config.gitPath;
        const jira = args.jira || args.j;

        // Error exit
        if (!version || !path || !jira) {
            console.log(help['version-update']);

            error(`Not all required params where given!`, true);
        }

        const gitDir = config.gitPath;
        const git = simpleGit(gitDir);

        console.log(`\n`);
        console.log(chalk.cyanBright(`Version update:`));
        console.log(chalk.cyanBright(`===============`));

        spinner.start();

        const handler = async (error) => {
            console.log(`- Pushed files..............`);

            spinner.stop();

            if (error) {
                error(error.error, true);
            }

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
        error(err, true, spinner);
    }
}