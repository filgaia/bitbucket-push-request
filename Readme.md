## Introduction

Node module to make a pull request for bitbucket after doing some changes.

This project was based in [Creating A Real-World CLI App With Node](https://timber.io/blog/creating-a-real-world-cli-app-with-node/).

For more information of **Bitbucket Rest API** you can go to the [Documentation](https://developer.atlassian.com/server/bitbucket/how-tos/command-line-rest/).

If you wanna create the **Slack Notification** you can go to the [Webhook Incoming Documentation](https://api.slack.com/incoming-webhooks)


This app was built for [NodeJS](https://nodejs.org/es/).

## How to install it

`npm i bitbucket-push-request --save-dev`

## How to run it

- `./bin/push` or
- Add it to your `package.json` as a `script` like this: 
`"push": "node node_modules/bitbucket-push-request/bin/push"`
- Run it from there with `npm run push`
- Send the commands with the `--` before the commands. Example:
`npm run push pr -- -j <jira> -m <message>`

## How to link it

`npm link`

After you link it, you can run it as *push*

## Help

Run `push help`

## Configuration

For the use, you need to do the following:

- Create a copy of the file `bb-pr-config-template.json` and rename it as `bb-pr-config.json`
- Fill the values for *authentication* and *bitbucket* repository

## Available Commands

- `full` - push, pull-request and slack notification
- `pr` - push, create a pull request and slack notification
- `forks` - show the forks for the repository
- `slack` - send a message to slack hook
- `tag` - create a tag in remote based on the *package.json* version
- `version-update` - Update the version in the *package.json*
- `lib-update` - Update the version in the *package.json* dependency of parent app

## Examples of use

- `push pr -j <code> -m <my title>`
- `push full -j <code> -m <message> -n <version>`
- `push version-update -n <version> -p <path> -j <code>`
- `push lib-update -n <version> -j <code> -t <feature>`
- `push tag`

## Requirements

- You need at least *Node 8.0* to run it