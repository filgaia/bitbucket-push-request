module.exports = (params) => {
    const git = params.git;
    const remote = params.remote;
    const destination = params.destination;

    const path = params.path;
    const filename = `../${path}/package.json`;
    const file = require(filename);

    git.status((err, summary) => {
        if (summary.current === destination) {
            git.pull(remote, destination, { '--rebase': null })
                .addTag(file.version, params.errorHandler)
                .push(remote, file.version, { '--no-verify': null }, params.finish);
        } else {
            git.checkout(destination)
                .pull(remote, destination, { '--rebase': null })
                .addTag(file.version, params.errorHandler)
                .push(remote, file.version, { '--no-verify': null }, params.finish);
        }
    });
}