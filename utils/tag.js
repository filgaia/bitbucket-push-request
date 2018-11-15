// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = (params) => {
    const name = params.name;
    const git = params.git;
    const remote = params.remote || config.remote;

    git.addTag(name)
        .push(remote, name, { '--no-verify': null }, params.finish);
}