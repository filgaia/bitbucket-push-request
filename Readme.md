## Introduction

Node module to make a pull request for bitbucket after doing some changes.

This project was based in [Creating A Real-World CLI App With Node](https://timber.io/blog/creating-a-real-world-cli-app-with-node/).

This app was built for [NodeJS](https://nodejs.org/es/).

## How to run it

`./bin/push`

## How to link it

`npm link`

After you link it, you can run it as *push*

## Help

Run `push help`

## Configuration

For the use, you need to do the following:

- Create a copy of the file `bb-pf-config-template.json` and rename it as `bb-pf-config.json`
- Fill the values for *authentication* and *bitbucket* repository

## Available Commands

- `full` - push, pull-request and slack notification
- `pull-request` - create a pull request
- `forks` - show the forks for the repository
- `slack` - Send a message to slack hook
- `version-update` - Update the version in the *package.json*

## Examples of use

- `push pull-request -j <code> -m <my title> -o <myBranch> -d <destinationBranch>`
- `push full -j <jira> -m <message> -n <version>`
- `push version-update -n <version> -p <path> -j <code>`

## Requirements

- You need at least *Node 8.0* to run it