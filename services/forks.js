// @vendors
const axios = require('axios');
const get = require('lodash/get');
const email = require('git-user-email');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async () => {
    const results = await axios({
        method: 'get',
        url: `${config.url}/rest/api/1.0/projects/${config.project}/repos/${config.repository}/forks`,
        auth: {
            username: email(),
            password: get(config, 'auth.password')
        }
    });

    return get(results, 'data.values');
};
