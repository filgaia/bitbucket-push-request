const chalk = require('chalk');
const get = require('lodash/get');

module.exports = (message, exit, spinner) => {

    const data = get(message, 'response.data.errors');

    if (spinner) {
        spinner.stop();
    }

    if (data) {
        data.forEach((i) => {
            console.log(chalk.red(get(i, 'message')));
        });
    }
    else {
        console.error(chalk.red(message));
    }

    exit && process.exit(1);
}