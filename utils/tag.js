// @vendors
const get = require('lodash/get');
const simpleGit = require('simple-git/promise');
// @config
const config = require(appRoot + '/bb-pr-config.json');
// @utils
const error = require('../utils/error');

module.exports = async (params) => {
    const gitDir = config.gitPath;
    const git = simpleGit(gitDir);
    const file = require(`../${gitDir}/package.json`);
    let tag = params.tag || file.version;

    try {
        const status = await git.status();

        if (status.current !== params.destination) {
            await git.checkout(params.destination);
        }

        await git.pull(params.remote, params.destination, { '--rebase': null });

        const summary = await git.tags();
        const tagList = get(summary, 'all');

        if (!tagList.find(t => t === tag)) {
            console.log('Creating tag...');
            await git.addTag(tag);
            await git.push(params.remote, tag, { '--no-verify': null });
        } else {
            tag = null;
            error('Tag already exists!', false);
        }

        return tag;
    } catch (response) {
        error(response, true, params.spinner);
    }
};
