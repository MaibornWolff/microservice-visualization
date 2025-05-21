import * as d3 from 'd3'
import { default as queryString } from 'query-string'
import * as _ from 'lodash'

import { system as rawSystem } from '../exampleSystems/simpleSystem.js'
import { Node } from '../domain/model.js'
import { Options as SystemToDotOptions } from '../domain/systemToDot.js'

export class LoadExampleAction {
  install(displaySystem: (node: Node, systemToDotOptions: SystemToDotOptions) => void) {
    this.registerHandlers(displaySystem)
  }

  registerHandlers(displaySystem: (node: Node, systemToDotOptions: SystemToDotOptions) => void) {
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
