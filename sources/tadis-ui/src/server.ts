import * as express from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as envYaml from './envYamlString'
const vizJs = require('viz.js')

import { appBaseUrl } from './appBaseUrl'
import { SystemProvider } from './systemProvider/SystemProvider'
import { SystemFetcher } from './systemProvider/SystemFetcher'
import { ConsulAnalyzerServiceResolver } from './systemProvider/ConsulAnalyzerServiceResolver'
import { SystemToDotConverter, Options as ConverterOptions } from './domain/systemToDot'
import { Node } from './domain/model'

dotenv.config()
envYaml.config()

const app = express()

const htmlDir = path.join(process.cwd(), 'src', 'html')
const bundleDir = path.join(process.cwd(), 'build', 'bundle')

app.use(`${appBaseUrl}/html`, express.static(htmlDir))
app.use(`${appBaseUrl}/html`, express.static(bundleDir))

if (isProduction()) {
  console.log('running in production mode')
}

addRestHandlers(app)

const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log('running on http://localhost:' + PORT)

function addRestHandlers(app: express.Express) {
  const systemFetcher = new SystemFetcher(process.env.SYSTEM_PROVIDER_URL, getAnalyzerServiceResolver())
  const systemProvider = new SystemProvider(systemFetcher)

  // INFO: could add /dot endpoint which is used instead of /system
  // - then /dot is used directly when rendering the system
  // - requires to compute focus on nodes in backend of frontend as well

  app.get(`${appBaseUrl}/system`, (req, res) => {
    systemProvider.getSystem(req.query).then(system => {
      if (system) {
        res.send(system)
      } else {
        throw new Error('fetched system was empty')
      }
    })
      .catch(error => {
        res.status(500).send('an error occured: ' + error)
      })
  })

  app.get(`${appBaseUrl}/svg`, (req, res) => {
    systemProvider.getSystem(req.query).then(system => {
      if (system) {
        let options: ConverterOptions = {
          urlExtractor: (node: Node) => node.getProp('url', null),
          showDebug: req.query.debug ? true : false
        }
        const dotSystem = new SystemToDotConverter(options).convertSystemToDot(system)
        const svgSystem = vizJs(dotSystem, { format: 'svg', engine: 'dot' })
        res.send(svgSystem)
      } else {
        throw new Error('fetched system was empty')
      }
    })
      .catch(error => {
        res.status(500).send('an error occured: ' + error)
      })
  })

  app.get(`${appBaseUrl}/dot`, (req, res) => {
    systemProvider.getSystem(req.query).then(system => {
      if (system) {
        let options: ConverterOptions = {
          urlExtractor: (node: Node) => node.getProp('url', null),
          showDebug: req.query.debug ? true : false
        }
        const dotSystem = new SystemToDotConverter(options).convertSystemToDot(system)
        res.send(dotSystem)
      } else {
        throw new Error('fetched system was empty')
      }
    })
      .catch(error => {
        res.status(500).send('an error occured: ' + error)
      })
  })

  app.get('/', (req, res) => {
    const endpoints = app._router.stack
      .filter((element) => element.route && element.route.path)
      .map((element) => {
        let method = ''
        if (element.route.stack[0].method) {
          method = element.route.stack[0].method.toUpperCase()
        }
        return { 'path': element.route.path, 'method': method }
      })

    endpoints.push({
      method: 'GET',
      path: '' + appBaseUrl + '/html/'
    })

    const endpointHtml = endpoints.map(endpoint => `${endpoint.method}: <a href="${endpoint.path}">${endpoint.path}</a>`).join('<br/>')

    res.send(`<h1>API</h1>${endpointHtml}`)
  })

  app.get(`${appBaseUrl}/version`, (req, res) => {
    res.send(process.env.npm_package_version)
  })
}

function getAnalyzerServiceResolver() {
  if (process.env.CONSUL_BASE_URL
    && process.env.SYSTEM_PROVIDER_SERVICE_NAME
    && process.env.SYSTEM_PROVIDER_SERVICE_ENDPOINT) {
    return new ConsulAnalyzerServiceResolver(
      process.env.CONSUL_BASE_URL,
      process.env.SYSTEM_PROVIDER_SERVICE_NAME,
      process.env.SYSTEM_PROVIDER_SERVICE_ENDPOINT)
  }
  return null
}

function isProduction() {
  return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
}
