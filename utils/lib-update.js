// @vendors
var fs = require('fs');
// @utils
const error = require('../utils/error');
// @config
const config = require(appRoot + '/bb-pr-config.json')

const pushChanges = async (git, jira, branch, message, finish) => {
    // Handlers
    const deleteHandler = (error) => {

        if (error) {
            return error(error, true);
        }

        git.checkoutLocalBranch(branch, () => console.log(`- Checked out branch ${branch}...`))
            .add('./*', () => console.log(`- Added the files..............`))
            .commit(`${jira} - ${message}`, () => {
                console.log(`- Committed files..............`);

                git.push(['-u', config.remote, branch], { '--no-verify': null, '--force': null }, finish);
            });
    };

    const branchLocalHandler = (error, summary) => {
        if (error) {
            return error(error, true);
        }

        if (summary.branches[branch]) {
            git.deleteLocalBranch(branch, (err, response) => {
                console.log(`- Deleted local branch ${branch}...`);
                deleteHandler(err, response);
            });
        } else {
            deleteHandler();
        }
    }

    git.branchLocal(branchLocalHandler);
}

module.exports = (params) => {
    const path = params.path;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    const branch = params.branch;

    const oldVersion = file.dependencies[config.repository];
    const newVersion = oldVersion.substr(0, oldVersion.indexOf('#') + 1) + params.version;

    file.dependencies[config.repository] = newVersion;

    fs.writeFile(`${path}/package.json`, JSON.stringify(file, null, 4), async (err) => {

        if (err) {
            return error(err, true);
        }

        console.log('- Writing to ' + filename + '...');

        pushChanges(params.git, params.jira, branch, params.message, params.finish);
    });
}