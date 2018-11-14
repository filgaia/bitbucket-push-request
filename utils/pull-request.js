// @vendors
const axios = require('axios');
// @config
const config = require(appRoot + '/bb-pr-config.json')

module.exports = async (dest) => {
    const destination = dest || config.destination;

    const results = await axios({
        method: 'post',
        url: config.url + '/rest/api/1.0/projects/' + config.project + '/repos/' + config.repository + '/pull-requests',
        auth: config.auth,
        data: {
            title: 'Talking Nerdy',
            description: 'It’s a kludge, but put the tuple from the database in the cache.',
            state: 'OPEN',
            open: true,
            closed: false,
            fromRef: {
                id: "refs/heads/release-11.01",
                repository: {
                    slug: config.repository,
                    name: null,
                    project: {
                        key: config.fork
                    }
                }
            },
            toRef: {
                id: "refs/heads/" + destination,
                repository: {
                    slug: config.repository,
                    name: null,
                    project: {
                        key: config.project
                    }
                }
            },
            locked: false,
            reviewers: config.reviewers
        },
    });

    return results.data;
}