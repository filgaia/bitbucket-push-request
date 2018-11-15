// @vendors
var fs = require('fs');
// @config
const config = require(appRoot + '/bb-pr-config.json')

const pushCurrentChanges = async (git, jira, finish) => {
    git.add('./*', () => console.log(`- Added the files..............`))
        .commit(`${jira} - Update package.json version`, () => console.log(`- Committed files..............`))
        .push(['-u', config.remote, jira], { '--no-verify': null, '--force': null }, finish);
}

const pushChanges = async (git, jira, finish) => {
    // Handlers
    const branchLocalHandler = async (error, summary) => {
        if (summary.branches[jira]) {
            git.deleteLocalBranch(jira, () => console.log(`- Deleted local branch ${jira}...`)).checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                .add('./*', () => console.log(`- Added the files..............`))
                .commit(`${jira} - Update package.json version`, () => console.log(`- Committed files..............`))
                .push(['-u', config.remote, jira], { '--no-verify': null, '--force': null }, finish);
        } else {
            git.checkoutLocalBranch(jira, () => console.log(`- Checked out branch ${jira}...`))
                .add('./*', () => console.log(`- Added the files..............`))
                .commit(`${jira} - Update package.json version`, () => console.log(`- Committed files..............`))
                .push(['-u', config.remote, jira], { '--no-verify': null, '--force': null }, finish);
        }
    }

    git.branchLocal(branchLocalHandler);
}

module.exports = (params) => {
    const path = params.path || config.gitPath;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    file.version = params.version || file.version;

    fs.writeFile(`${path}/package.json`, JSON.stringify(file, null, 4), async (err) => {

        if (err) {
            return console.log(err);
        }

        console.log('- Writing to ' + filename + '...');

        if (params.push && params.newBranch) {
            pushChanges(params.git, params.jira, params.finish);
        } else {
            pushCurrentChanges(params.git, params.jira, params.finish);
        }
    });
}