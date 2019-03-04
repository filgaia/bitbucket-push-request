// @vendors
var fs = require('fs');
const simpleGit = require('simple-git/promise');
// @utils
const error = require('../utils/error');
// @config
const config = require(appRoot + '/bb-pr-config.json');

const fileHandler = async (filename, params, err) => {
    const path = config.parentPath;
    const git = simpleGit(path);

    if (err) {
        return error(err, true);
    }

    console.log('- Writing to ' + filename + '...');

    try {
        const summary = await git.branchLocal();

        if (summary.branches[params.branch]) {
            await git.branch(['-D', params.branch]);
            console.log(`- Deleted local branch ${params.branch}...`);
        }

        await git.checkoutLocalBranch(params.branch);
        console.log(`- Checked out branch ${params.branch}...`);

        await git.add('./*');
        console.log(`- Added the files..............`);

        await git.commit(`${params.title}`);
        console.log(`- Committed files..............`);

        await git.push(['-u', config.remote, params.branch], { '--no-verify': null, '--force': null });
        params.finish(params);
    } catch (response) {
        error(response, true, params.spinner);
    }
};

module.exports = (params) => {
    const path = config.parentPath;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    const oldVersion = file.dependencies[config.repository];
    const newVersion = oldVersion.substr(0, oldVersion.indexOf('#') + 1) + params.version;

    file.dependencies[config.repository] = newVersion;

    fs.writeFile(`${path}/package.json`, JSON.stringify(file, null, 4), async (err) => {
        fileHandler(filename, params, err);
    });
};
