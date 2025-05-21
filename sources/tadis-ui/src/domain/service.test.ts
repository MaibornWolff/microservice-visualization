import { describe, it, expect } from 'vitest';
import { Node } from '../../src/domain/model.js';
import { GraphService } from '../../src/domain/service.js';

describe('graph service functions', () => {
  it('find nodes by id', () => {
    const graph: Node = Node.ofRawNode({
      id: 'test-graph',
      nodes: [
        { id: 'a' },
        {
          id: 'b',
          nodes: [
            { id: 'c' }
          ]
        }
      ]
    })
    const graphService = new GraphService(graph)

    expect(graphService.findNode('a').id).toBe('a');
    expect(graphService.findNode('c').id).toBe('c');
  });

  it('reduce node to certain nodes', () => {
    const node: Node = Node.ofRawNode({
      id: 'a',
      nodes: [
        { id: 'b' },
        {
          id: 'c',
          nodes: [
            { id: 'd' },
            { id: 'e' }
          ],
          edges: [
            { sourceId: 'd', targetId: 'e' }
          ]
        }
      ],
      edges: [
        { sourceId: 'b', targetId: 'c' },
        { sourceId: 'b', targetId: 'd' }
      ]
    })
    const graphService = new GraphService(node)

    expect(graphService.reduceNodesRecursive(node, ['b', 'c']))
      .toEqual(Node.ofRawNode({
        id: 'a',
        nodes: [
          { id: 'b' },
          { id: 'c' }
        ],
        edges: [
          { sourceId: 'b', targetId: 'c' }
        ]
      }));

    expect(graphService.reduceNodesRecursive(node, ['d', 'e']))
      .toEqual(Node.ofRawNode({
        id: 'a',
        nodes: [
          {
            id: 'c',
            nodes: [
              { id: 'd' },
              { id: 'e' }
            ],
            edges: [
              { sourceId: 'd', targetId: 'e' }
            ]
          }
        ]
      }));
  });
});
