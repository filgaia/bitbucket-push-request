const ora = require('ora');
const setPullRequest = require('../utils/pull-request');
const get = require('lodash/get');

module.exports = async () => {
    let spinner = null;

    try {
        console.log(`\n`);
        console.log(`Creating pull-request in ok-loans:`);
        console.log(`=================================`);

        spinner = ora().start();
        const result = await setPullRequest();

        spinner.stop('%j', result);
        console.log(`Operation Completed!!!`);
    } catch (err) {
        spinner.stop();

        console.log(`Errors:`);
        console.log(`=======`);

        const data = get(err, 'response.data.errors');

        if (data) {
            data.forEach((i) => {
                console.log(get(i, 'message'));
            });
        }
        else {
            console.error(err);
        }
    }
}