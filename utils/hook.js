// @vendors
const axios = require('axios');
const get = require('lodash/get');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (text, attachments) => {
    const results = await axios({
        method: 'post',
        url: config.slackHook,
        data: {
            text,
            attachments
        }
    });

    return get(results, 'data.values');
}