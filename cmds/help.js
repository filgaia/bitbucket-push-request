const menus = {
    main: `
      push [command] <options>
  
      full ............... push, pull-request and slack notification
      pull-request ....... create a pull request
      forks .............. show your forks for the repository
      slack .............. test your slack connection
      version ............ show package version
      help ............... show help menu for a command`,

    full: `
      push full <options>
  
      --jira, -j ......... the jira version
      --message, -m ...... message for the commit and pull request
      --dest, -d ......... destination branch. By default destination in config file 
      --newVersion, -n ... new version for the file`,

    slack: `
      push slack <options>
  
      --message, -m ...... message for the commit and pull request`,

    'version-update': `
      push version-update <options>
  
      --jira, -j ......... the jira version
      --path, -p ......... path of file. By default gitPath in config file
      --newVersion, -n ... new version for the file`,

    'pull-request': `
      push pull-request <options>
      
      --jira, -j ......... the jira version
      --message, -m ...... message for the commit and pull request
      --origin, -o ....... origin branch. By default jira parameter
      --dest, -d ......... destination branch. by default destination in config file`,
}

module.exports = (args) => {
    const subCmd = args._[0] === 'help'
        ? args._[1]
        : args._[0]

    console.log(menus[subCmd] || menus.main)
}