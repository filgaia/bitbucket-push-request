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

const getCommit = async (args) => {
    const type = args.type || args.t || config.parentType;
    const git = simpleGit(config.gitPath);
    const log = await git.log(['-1', '--format=%s']);
    const title = get(log, 'latest.hash', '');
    const logMessage = title.split(' - ');
    const jira = get(logMessage, '0', config.repository).trim();
    const parentBranch = args.branch || args.b || `${type}/${config.repository}/${jira}/lib-update`;

    return {
        jira,
        title,
        parentBranch
    };
};

const updateRepo = async (commit) => {
    const git = simpleGit(config.gitPath);
    const summary = await git.branchLocal();

    if (summary.branches[commit.jira]) {
        await git.branch(['-D', commit.jira]);
        console.log(`- Deleted local branch ${commit.jira}...`);
    }

    await git.checkoutLocalBranch(commit.jira);
    console.log(`- Checked out branch ${commit.jira}...`);

    await git.add('./*');
    console.log(`- Added the files..............`);

    await git.commit(`${commit.title}`);

    console.log(`- Committed files..............`);
};

const finish = async (params) => {
    console.log(`- Pushed changes ${params.repository}..............`);

    try {
        const response = await setPullRequest({
            destination: params.destination,
            jira: params.jira,
            title: params.title
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
        const destination = args.dest || args.d || config.destination;
        const parentDestination = args.parentDestination || args.pd || config.parentDestination;
        const path = config.gitPath;
        const parentPath = config.parentPath;

        checkParams(version);

        getTitle();
        spinner.start();

        // Get the last commit info
        const commit = await getCommit(args);

        // TODO: Include for cherry-pick
        // const commitHash = get(response, 'commit');

        // Updating the changes for repository
        await updateRepo(commit);

        const finishParams = {
            destination,
            forked: true,
            jira: commit.jira,
            title: commit.title,
            origin: commit.jira,
            repository: config.repository,
            spinner
        };

        getFile({
            finish: () => finish(finishParams),
            jira: commit.jira,
            newBranch: false,
            path,
            push: !!commit.jira,
            version
        });

        // Updating the changes for parent
        if (parentPath) {
            const parentParams = {
                destination: parentDestination,
                forked: false,
                jira: commit.jira,
                title: commit.title,
                origin: commit.parentBranch,
                repository: config.parentRepo,
                spinner
            };

            getLibFile({
                finish: () => finish(parentParams),
                branch: commit.parentBranch,
                jira: commit.jira,
                title: commit.title,
                version
            });
        }
    } catch (err) {
        error(err, true, spinner);
    }
};
