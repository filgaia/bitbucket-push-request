// @vendors
const axios = require('axios');
const get = require('lodash/get');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async () => {
    const results = await axios({
        method: 'get',
        url: config.url + '/rest/api/1.0/projects/' + config.project + '/repos/' + config.repository + '/forks',
        auth: config.auth
    });

    return get(results, 'data.values');
}