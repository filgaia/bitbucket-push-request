// @vendors
var fs = require('fs');
// @utils
const error = require('../utils/error');
// @config
const config = require(appRoot + '/bb-pr-config.json')

const pushCurrentChanges = (git, jira, finish) => {
    git.add('./*', () => console.log(`- Added the files..............`))
        .commit(`${jira} - Update package.json version`, () => console.log(`- Committed files..............`))
        .push(['-u', config.remote, jira], { '--no-verify': null, '--force': null }, finish);
}

const pushChanges = (git, jira, finish) => {
    // Handlers
    const branchLocalHandler = (error, summary) => {
        if (summary.branches[jira]) {
            git.branch(['-D', jira], () => console.log(`- Deleted local branch ${jira}...`))
                .checkoutLocalBranch(jira, () => {
                    console.log(`- Checked out branch ${jira}...`);
                    pushCurrentChanges(git, jira, finish);
                });
        } else {
            git.checkoutLocalBranch(jira, () => {
                console.log(`- Checked out branch ${jira}...`);
                pushCurrentChanges(git, jira, finish);
            });
        }
    }

    git.branchLocal(branchLocalHandler);
}

module.exports = (params) => {
    const path = params.path;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    file.version = params.version;

    fs.writeFile(`${path}/package.json`, JSON.stringify(file, null, 4), async (err) => {

        if (err) {
            return error(err, true);
        }

        console.log('- Writing to ' + filename + '...');

        if (params.push && params.newBranch) {
            pushChanges(params.git, params.jira, params.finish);
        } else {
            pushCurrentChanges(params.git, params.jira, params.finish);
        }
    });
}