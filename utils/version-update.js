// @vendors
var fs = require('fs');
const simpleGit = require('simple-git/promise');
// @utils
const error = require('../utils/error');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const logEvent = (event) => {
    console.log(`- ${event}..............`);
};

const deleteBranch = async (jira) => {
    const gitDir = config.gitPath;
    const git = simpleGit(gitDir);
    const summary = await git.branchLocal();

    if (summary.branches[jira]) {
        await git.branch(['-D', jira]);
        logEvent(`Deleted local branch ${jira}`);
    }

    await git.checkoutLocalBranch(jira);
    logEvent(`Checked out branch ${jira}`);
};

const fileHandler = async (filename, params, err) => {
    const gitDir = config.gitPath;
    const git = simpleGit(gitDir);

    if (err) {
        return error(err, true);
    }

    logEvent(`Writing to ${filename}`);

    try {
        if (params.push && params.newBranch) {
            await deleteBranch(params.jira);
        }

        await git.add('./*');
        logEvent('Added the files');

        await git.commit(`${params.jira} - Update package.json version`);
        logEvent('Committed files');

        await git.push(['-u', config.remote, params.jira], { '--no-verify': null, '--force': null });
        params.finish(params.spinner);
    } catch (response) {
        error(response, true, params.spinner);
    }
};

module.exports = async (params) => {
    const gitDir = config.gitPath;
    const git = simpleGit(gitDir);
    const path = params.path;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    file.version = params.version;

    await git.checkout('master');

    fs.writeFile(`${path}/package.json`, JSON.stringify(file, null, 4), (err) => {
        fileHandler(filename, params, err);
    });
};
