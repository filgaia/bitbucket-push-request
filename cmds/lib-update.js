// @vendors
const ora = require('ora');
const chalk = require('chalk');
const get = require('lodash/get');
// @utils
const getLibFile = require('../utils/lib-update');
const error = require('../utils/error');
const help = require('../utils/help');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const callSlack = async (params) => {
    console.log(`Calling the Slack for PR #${params.id}...`);
    await getMessage(params);
};

const finish = async (params) => {
    console.log(`- Pushed files..............`);

    try {
        // Pull Request
        const response = await setPullRequest({
            destination: params.destination,
            forked: false,
            jira: params.jira,
            message: params.message,
            origin: params.branch,
            repository: params.repository
        });

        await callSlack({
            id: response.id,
            jira: params.jira,
            destination: params.destination,
            repository: params.repository
        });

        params.spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        error(err, true, params.spinner);
    }
};

const getTitle = () => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Library update:`));
    console.log(chalk.cyanBright(`===============`));
};

const chreckParams = (version, jira) => {
    if (!version || !jira) {
        console.log(help['lib-update']);

        error(`Not all required params where given!`, true);
    }
};

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const jira = args.jira || args.j;
        const type = args.type || args.t || get(config, 'parent.type');
        const branch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;
        const title = `${jira} - Update ${config.repository} version`;

        chreckParams(version, jira);

        getTitle();
        spinner.start();

        getLibFile({
            branch,
            finish,
            title,
            spinner,
            version
        });
    } catch (err) {
        error(err, true, spinner);
    }
};
