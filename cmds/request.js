// @vendors
const ora = require('ora');
const get = require('lodash/get');
const isUndefined = require('lodash/isUndefined');
const chalk = require('chalk');
const simpleGit = require('simple-git/promise');
// @utils
const error = require('../utils/error');
const getTag = require('../utils/tag');
// @services
const setPullRequest = require('../services/request');
const getMessage = require('../services/hook');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const getTitle = (repository) => {
    console.log(`\n`);
    console.log(chalk.cyanBright(`Creating pull-request in ${repository}:`));
    console.log(chalk.cyanBright(`=================================`));
};

const callSlack = async (params, notify) => {
    if (notify) {
        console.log(`Calling the Slack for PR #${params.id}...`);

        await getMessage(params);
    }
};

const getCommit = async (params) => {
    const git = simpleGit(params.gitDir);
    const log = await git.log(['-1', '--format=%s']);
    const logMessage = get(log, 'latest.hash', '').split(' - ');
    const jira = logMessage[0].trim();
    const message = logMessage[1].trim();

    const summary = await git.branchLocal();
    const origin = get(summary, 'current');

    if (origin === params.destination) {
        error(`Origin cannot be the same as destination`, true, params.spinner);
    }

    // if we are doing a parent request we check the tag and create it if needed.
    if (params.parent && params.checkTag) {
        console.log('Checking the tag...');

        await getTag({
            destination: params.tagDestination,
            remote: params.location,
            spinner: params.spinner
        });
    }

    return {
        jira,
        message,
        origin
    };
};

module.exports = async (args) => {
    let spinner = ora();

    try {
        const location = args.location || args.l || 'upstream';
        const parent = !!args.hasOwnProperty('parent');
        const checkTag = args.hasOwnProperty('check-tag');
        const verify = !args.hasOwnProperty('verify');
        const notify = !args.hasOwnProperty('notify');
        const tagDestination = args.t || args['tag-destination'] || config.destination;
        let repository = args.r || args.repo;
        let destination = args.dest || args.d;
        let pushOptions = { '--force': null };

        const gitDir = parent ? config.parentPath : config.gitPath;
        const git = simpleGit(gitDir);

        if (isUndefined(repository)) {
            repository = parent ? config.parentRepo : config.repository;
        }

        if (isUndefined(destination)) {
            destination = parent ? config.parentDestination : config.destination;
        }

        if (!verify) {
            pushOptions['--no-verify'] = null;
        }

        getTitle(repository);
        spinner.start();

        // Get the last commit info
        const commit = await getCommit({
            checkTag,
            destination,
            gitDir,
            location,
            parent,
            spinner,
            tagDestination
        });

        console.log(`Creating push for branch ${commit.origin}`);
        await git.outputHandler((command, stdout, stderr) => {
            stdout.pipe(process.stdout);
            stderr.pipe(process.stderr);
        }).push(['-u', config.remote, commit.origin], pushOptions);

        console.log(`Creating pull-request for branch ${commit.origin}`);
        const response = await setPullRequest({
            destination,
            jira: commit.jira,
            message: commit.message,
            origin: commit.origin,
            repository,
            forked: !parent
        });

        await callSlack({
            jira: commit.jira,
            repository: repository,
            id: response.id
        }, notify);

        spinner.stop();

        console.log(`Operation Completed!!!`);
    } catch (err) {
        error(err, true, spinner);
    }
};
