// @vendors
const axios = require('axios');
const get = require('lodash/get');
const chalk = require('chalk');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (text, attachments) => {
    if (config.slackHook) {
        const results = await axios({
            method: 'post',
            url: config.slackHook,
            data: {
                text,
                attachments
            }
        });

        return get(results, 'data.values');
    } else {
        console.error(chalk.red('There is no Slack Hook defined'));
    }
}