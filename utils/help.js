module.exports = {
    main: `
        push [command] <options>

        full ............... push, pull-request and slack notification
        pr ................. create a pull request and do a push
        forks .............. show your forks for the repository
        lib-update ......... Update the dependency in the parent app
        slack .............. test your slack connection
        tag ................ create a tag with slack notification
        version-update ..... update the version in package.json
        version ............ show package version
        help ............... show help menu for a command`,

    full: `
        push full <options>

        --dest, -d ......... destination branch. By default destination in config file
        --branch, -b ....... name of the branch. By default it uses a convention
        --type, -t ......... type of feature to update
        --newVersion, -n ... new version for the file`,

    slack: `
        push slack <options>

        --message, -m ...... message for the commit and pull request
        --parent ........... if send determine if use the parent in configuration file
        --id -i ............ id of the PR`,

    tag: `
        push tag <options>

        --dest, -d ......... destination branch. by default destination in config file
        --remote, -r ...... name of the remote. By default the config remote
        --tag, -t ......... tag to create. By default the version of the package.json`,

    pr: `
        push pr <options>

        --parent ........... if send determine if use the parent in configuration file
        --dest, -d ......... destination branch. by default destination in config file
        --repo, -d ......... repository. by default destination in config file
        --location, -l ..... the remote. By default config origin
        --forked ........... The origin is in a fork
        --check-tag ........ if send the pr will check if the tag exists
        --no-verify ........ if send it will be sended to the push command
        --no-notify ........ if send it will not call slack`,

    'lib-update': `
        push lib-update <options>

        --jira, -j ......... the jira version
        --branch, -b ....... name of the branch. By default it uses a convention
        --dest, -d ......... destination branch. by default parentDestination in config file
        --type, -t ......... type of feature to update
        --newVersion, -n ... new version for the file`,

    'version-update': `
        push version-update <options>

        --jira, -j ......... the jira version
        --path, -p ......... path of file. By default gitPath in config file
        --newVersion, -n ... new version for the file`
};
