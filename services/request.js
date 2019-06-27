// @vendors
const axios = require('axios');
const get = require('lodash/get');
const email = require('git-user-email');
// @config
const config = require(appRoot + '/bb-pr-config.json');

module.exports = async (params) => {
    const destination = params.destination;
    const repository = params.repository || config.repository;
    const fromProject = params.forked ? config.fork : config.project;

    const results = await axios({
        method: 'post',
        url: `${config.url}/rest/api/1.0/projects/${config.project}/repos/${repository}/pull-requests`,
        auth: {
            username: email(),
            password: get(config, 'auth.password')
        },
        data: {
            title: `${params.title}`,
            description: `Jira: ${config.jira + params.jira}`,
            state: 'OPEN',
            open: true,
            closed: false,
            fromRef: {
                id: `refs/heads/${params.origin}`,
                repository: {
                    slug: repository,
                    name: null,
                    project: {
                        key: fromProject
                    }
                }
            },
            toRef: {
                id: `refs/heads/${destination}`,
                repository: {
                    slug: repository,
                    name: null,
                    project: {
                        key: config.project
                    }
                }
            },
            locked: false,
            reviewers: get(config, 'reviewers', []).map(name => ({
                user: {
                    name
                }
            }))
        },
    });

    return results.data;
};
