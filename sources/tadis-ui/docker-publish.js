const execSync = require('child_process').execSync

const retag = `docker tag ${process.env.npm_package_name}:${process.env.npm_package_version} andreasblunkmw/${process.env.npm_package_name}:${process.env.npm_package_version}`
console.log('executing: ' + retag)
execSync(retag, { stdio: [0, 1, 2] })

const publish = `docker push andreasblunkmw/${process.env.npm_package_name}:${process.env.npm_package_version}`
console.log('executing: ' + publish)
execSync(publish, { stdio: [0, 1, 2] })
