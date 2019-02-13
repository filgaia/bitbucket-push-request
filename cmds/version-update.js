// @vendors
const ora = require('ora');
const chalk = require('chalk');
// @utils
const getFile = require('../utils/version-update');
const error = require('../utils/error');
const help = require('../utils/help');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const finish = (spinner) => {
    console.log(`- Pushed files..............`);
    spinner.stop();
    console.log(`Operation Completed!!!`);
};

const checkParams = (version, jira) => {
    // Error exit
    if (!version || !jira) {
        console.log(help['version-update']);
        error(`Not all required params where given!`, true);
    }
};

const getTitle = () => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Version update:`));
    console.log(chalk.cyanBright(`===============`));
};

module.exports = async (args) => {
    let spinner = ora();

    const version = args.newVersion || args.n;
    const path = args.path || args.p || config.gitPath;
    const jira = args.jira || args.j;

    checkParams(version, jira);

    getTitle();
    spinner.start();

    getFile({
        finish,
        jira,
        newBranch: true,
        path,
        push: !!jira,
        spinner,
        version
    });
};
