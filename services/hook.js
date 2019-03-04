// @vendors
const axios = require('axios');
const get = require('lodash/get');
const chalk = require('chalk');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (params) => {
    const data = {};

    if (params.jira) {
        data.text = `A new *PR* for <${config.jira}${params.jira}|${params.jira}> have been created!`;
        data.attachments = [
            {
                color: 'good',
                footer: config.auth.username,
                title: `PR ${params.repository}/${params.destination} #${params.id} - ${params.jira}`,
                title_link: `${config.url}/projects/${config.project}/repos/${params.repository}/pull-requests/${params.id}/overview`
            }
        ];
    } else if (params.tag) {
        data.text = `A new *Tag* for *${config.repository} (${params.repository})* have been created!`;
        data.attachments = [
            {
                footer: config.auth.username,
                color: 'good',
                title: `${params.tag}`
            }
        ];
    } else {
        data.text = params.text;
    }

    if (config.slackHook) {
        const results = await axios({
            method: 'post',
            url: config.slackHook,
            data
        });

        return get(results, 'data.values');
    } else {
        console.error(chalk.red('There is no Slack Hook defined'));
    }
};
