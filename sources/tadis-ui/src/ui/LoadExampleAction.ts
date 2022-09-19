import * as d3 from 'd3'
import * as queryString from 'query-string'
import * as _ from 'lodash'

import { system as rawSystem } from '../exampleSystems/simpleSystem'
import { Node } from '../domain/model'
import { Options as SystemToDotOptions } from '../domain/systemToDot'

export class LoadExampleAction {
  install(displaySystem: (Node, SystemToDotOptions) => void) {
    this.registerHandlers(displaySystem)
  }

  registerHandlers(displaySystem: (Node, SystemToDotOptions) => void) {
    d3.select('#load-example-link').on('click', () => {
      const system = Node.ofRawNode(rawSystem)

      const parsedUrl = queryString.parseUrl(window.location.href)
      const parsedQuery = parsedUrl.query
      const rankDir: string = parsedQuery.rankdir && _.isString(parsedQuery.rankdir) ? parsedQuery.rankdir : undefined
      const showDebug: boolean = parsedQuery.debug !== undefined

      const options: SystemToDotOptions = {
        urlExtractor: () => '',
        showDebug,
        rankDir
      }
      displaySystem(system, options)
    })
  }
}
