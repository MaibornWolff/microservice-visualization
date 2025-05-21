import { expect } from 'vitest'
import { Node } from '../model/core.js'

export function verifyEachContentHasFields(node: Node, fields: any) {
  node.nodes.forEach(n => expect(n.content).toMatchObject(fields))
  node.edges.forEach(e => expect(e.content).toMatchObject(fields))
}

export function verifyEachContentHasTransformer(node: Node, transformer: string) {
  if (node.nodes && node.nodes.length > 0) {
    node.nodes.forEach(n => expect(n.content?.metadata).toMatchObject({ transformer }))
  }
  if (node.edges && node.edges.length > 0) {
    node.edges.forEach(e => expect(e.content?.metadata).toMatchObject({ transformer }))
  }
}
