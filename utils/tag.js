// @vendors
const get = require('lodash/get');

module.exports = (params) => {
    const git = params.git;
    const remote = params.remote;
    const destination = params.destination;

    const path = params.path;
    const filename = `../${path}/package.json`;
    const file = require(filename);
    const tagName = file.version;

    const pullHandler = (err) => {

        if (err) {
            params.errorHandler(err);
        }

        // Check if tag exists
        git.tags((err, summary) => {
            const tagList = get(summary, 'all');

            if (!tagList.find(t => t === tagName)) {
                console.log('Creating tag...');

                git.addTag(tagName, params.errorHandler)
                    .push(remote, tagName, { '--no-verify': null }, params.finish);
            } else {
                params.finish({ error: 'Tag already exists!' });
            }
        });
    }
    git.status((err, summary) => {
        if (summary.current === destination) {
            git.pull(remote, destination, { '--rebase': null }, pullHandler);
        } else {
            git.checkout(destination)
                .pull(remote, destination, { '--rebase': null }, pullHandler);
        }
    });
}