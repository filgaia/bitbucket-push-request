// @vendors
const ora = require('ora');
const get = require('lodash/get');
const chalk = require('chalk');
const simpleGit = require('simple-git/promise');
// @utils
const getFile = require('../utils/version-update');
const getLibFile = require('../utils/lib-update');
// @services
const getMessage = require('../services/hook');
const setPullRequest = require('../services/request');
// @config
const config = require(appRoot + '/bb-pr-config.json');
const error = require('../utils/error');
const help = require('../utils/help');

const checkParams = (version) => {
    if (!version) {
        console.log(help['full']);

        error(`Not all required params where given!`, true);
    }
};

const getTitle = () => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Creating a full push:`));
    console.log(chalk.cyanBright(`=====================`));
};

const finish = async (params) => {
    console.log(`- Pushed changes ${params.repository}..............`);

    try {
        const response = await setPullRequest({
            destination: params.destination,
            jira: params.jira,
            message: params.message
        });

        console.log(`Calling the Slack for PRs.....`);

        await getMessage({
            jira: params.jira,
            repository: params.repository,
            id: response.id
        });

        params.spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        error(err, true, params.spinner);
    }
};

module.exports = async (args) => {
    let spinner = ora();

    try {
        const version = args.newVersion || args.n;
        const type = args.type || args.t || config.parentType;
        const destination = args.dest || args.d || config.destination;
        const parentDestination = args.parentDestination || args.pd || config.parentDestination;
        const path = config.gitPath;
        const parentPath = config.parentPath;

        checkParams(version);

        const git = simpleGit(path);

        getTitle();
        spinner.start();

        // Get the last commit info
        const log = await git.log(['-1', '--format=%s']);
        const logMessage = get(log, 'latest.hash', '').split(' - ');
        const jira = logMessage[0].trim();
        const message = logMessage[1].trim();
        const parentBranch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;

        // TODO: Include for cherry-pick
        // let commitHash = null;

        // Updating the changes for repository
        const summary = await git.branchLocal();

        if (summary.branches[jira]) {
            await git.branch(['-D', jira]);
            console.log(`- Deleted local branch ${jira}...`);
        }

        await git.checkoutLocalBranch(jira);
        console.log(`- Checked out branch ${jira}...`);

        await git.add('./*');
        console.log(`- Added the files..............`);

        await git.commit(`${jira} - ${message}`);

        console.log(`- Committed files..............`);

        // TODO: Include for cherry-pick
        // commitHash = get(response, 'commit');

        const finishParams = {
            destination,
            forked: true,
            jira,
            message,
            origin: jira,
            repository: config.repository,
            spinner
        };

        getFile({
            finish: () => finish(finishParams),
            git,
            jira,
            newBranch: false,
            path,
            push: !!jira,
            version
        });

        // Updating the changes for parent
        if (parentPath) {
            const parentParams = {
                destination: parentDestination,
                forked: false,
                jira,
                message,
                origin: parentBranch,
                repository: config.parentRepo,
                spinner
            };

            getLibFile({
                finish: () => finish(parentParams),
                branch: parentBranch,
                jira,
                message,
                version
            });
        }
    } catch (err) {
        error(err, true, spinner);
    }
};
