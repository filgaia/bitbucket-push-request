// @vendors
const minimist = require('minimist')
// @utils
const error = require('./utils/error')
// @root
var path = require('path');
global.appRoot = path.resolve(__dirname);

module.exports = () => {
    const args = minimist(process.argv.slice(2))

    let cmd = args._[0] || 'help'

    if (args.version || args.v) {
        cmd = 'version'
    }

    if (args.help || args.h) {
        cmd = 'help'
    }

    switch (cmd) {
        case 'full':
            require('./cmds/full')(args)
            break

        case 'pull-request':
            require('./cmds/pull-request')(args)
            break

        case 'forks':
            require('./cmds/forks')(args)
            break

        case 'version':
            require('./cmds/version')(args)
            break

        case 'slack':
            require('./cmds/slack')(args)
            break

        case 'help':
            require('./cmds/help')(args)
            break

        default:
            error(`"${cmd}" is not a valid command!`, true)
            break
    }
}