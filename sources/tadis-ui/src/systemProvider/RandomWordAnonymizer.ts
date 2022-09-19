import * as randomWord from 'random-word'
import { Node } from '../domain/model'
import { GraphService } from '../domain/service'

export class RandomWordAnonymizer {
  private nameMapping = new Map()

  anonymizeSystem(system: Node) {
    system.setName(this.getNewNameCached(system.getName()))

    GraphService.computeAllNodes(system).forEach(node => {
      node.setName(this.getNewNameCached(node.getName()))
    })
  }

  getNewNameCached(name) {
    const cachedNewName = this.nameMapping.get(name)
    if (cachedNewName) {
      return cachedNewName
    } else {
      const newName = this.getNewName(name)
      this.nameMapping.set(name, newName)
      return newName
    }
  }

  getNewName(name) {
    const newName = randomWord()
    console.log('replacing name ' + name + ' by ' + newName)

    if (name.startsWith('exchange')) {
      return 'exchange ' + newName
    } else {
      return newName
    }
  }
}
