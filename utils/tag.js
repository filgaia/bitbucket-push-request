module.exports = (params) => {
    const name = params.name;
    const git = params.git;
    const remote = params.remote;

    git.addTag(name)
        .push(remote, name, { '--no-verify': null }, params.finish);
}