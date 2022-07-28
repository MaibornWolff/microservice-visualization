import { System, AsyncEventFlow } from '../../../model/ms'

import { verifyEachContentHasTransformer } from '../../../test/verifiers'

import { PatternAnalyzer } from './PatternAnalyzer'
import { SystemPattern, NodePattern, SearchTextLocation } from './model'

describe('PatternAnalyzer.intraFileId', () => {
    const sourceFolder = __dirname + '/testdata/single-file-analysis-project'

    beforeEach(() => {
        process.env.NODE_ENV = 'test'
    })

    const ws = '\\s*'
    const id = '\\w+'

    function javaSourceFilePattern(): NodePattern {
        return {
            searchTextLocation: SearchTextLocation.FILE_PATH,
            regExp: '$sourceRoot/([^/]+)/source.java',
            capturingGroupIndexForName: 1,
            nodeType: 'MicroService'
        }
    }

    it('creates a service from a file path', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [javaSourceFilePattern()],
            edgePatterns: []
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.findMicroService('service1')).toBeDefined()
    })

    it('creates an async info flow for multiple annotations in the same file', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [],
            edgePatterns: [
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: javaSourceFilePattern(),
                    targetNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        regExp: `@EventProcessor${ws}\\([^)]*sendToExchange${ws}=${ws}(${id})`,
                        capturingGroupIndexForName: 1,
                        nameResolutionPattern: {
                            searchTextLocation: SearchTextLocation.FILE_CONTENT,
                            regExp: `$name${ws}=${ws}"([^"]*)"`,
                            capturingGroupIndexForName: 1
                        },
                        nodeType: 'MessageExchange'
                    }
                },
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: javaSourceFilePattern(),
                    targetNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        regExp: `@EventProcessor${ws}\\([^)]*sendToExchange${ws}=${ws}"([^"]+)"`,
                        capturingGroupIndexForName: 1,
                        nodeType: 'MessageExchange'
                    }
                }
            ]
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.findMicroService('service1')).toBeDefined()
        expect(outputSystem.findMessageExchange('target-exchange-X')).toBeDefined()
        expect(outputSystem.findMessageExchange('target-exchange-Y')).toBeDefined()

        // TODO: are there better ways to test parts of objects to match in jest?
        expect(
            outputSystem.edges.find(
                (edge) =>
                    edge.source.getName() === 'service1' &&
                    edge.target.getName() === 'target-exchange-X' &&
                    edge.content?.type === AsyncEventFlow.name
            )
        ).toBeDefined()

        expect(
            outputSystem.edges.find(
                (edge) => edge.source.getName() === 'service1' && edge.target.getName() === 'target-exchange-Y'
            )
        ).toBeDefined()

        verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
    })

    it('re-uses exchanges when they already exist', async () => {
        const inputSystem = new System('test')
        inputSystem.addMessageExchange('service1')

        const systemPattern: SystemPattern = {
            nodePatterns: [
                {
                    searchTextLocation: SearchTextLocation.FILE_PATH,
                    regExp: '$sourceRoot/([^/]+)/source.java',
                    capturingGroupIndexForName: 1,
                    nodeType: 'MessageExchange'
                }
            ],
            edgePatterns: []
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.findMessageExchange('service1')).toBeDefined()
        expect(outputSystem.nodes.filter((node) => node.getName() === 'service1')).toHaveLength(1)
    })

    it('can create nodes from multiple elements in the same annotation', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [],
            edgePatterns: [
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        regExp: `@EventProcessor${ws}\\([^)]*receiveFromExchange${ws}=${ws}"([^"]+)"`,
                        capturingGroupIndexForName: 1,
                        nodeType: 'MessageExchange'
                    },
                    targetNodePattern: javaSourceFilePattern()
                },
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: javaSourceFilePattern(),
                    targetNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        regExp: `@EventProcessor${ws}\\([^)]*sendToExchange${ws}=${ws}"([^"]+)"`,
                        capturingGroupIndexForName: 1,
                        nodeType: 'MessageExchange'
                    }
                }
            ]
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.findMicroService('service1')).toBeDefined()
        expect(outputSystem.findMessageExchange('source-exchange-Y')).toBeDefined()
        expect(outputSystem.findMessageExchange('target-exchange-Y')).toBeDefined()

        expect(
            outputSystem.edges.find(
                (edge) => edge.source.getName() === 'service1' && edge.target.getName() === 'target-exchange-Y'
            )
        ).toBeDefined()

        expect(
            outputSystem.edges.find(
                (edge) => edge.source.getName() === 'source-exchange-Y' && edge.target.getName() === 'service1'
            )
        ).toBeDefined()

        verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
    })

    it('ignores source found in current project when not run in test mode', async () => {
        process.env.NODE_ENV = 'non-test'

        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [javaSourceFilePattern()],
            edgePatterns: []
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem).not.toBeNull()

        expect(outputSystem.getMicroServices()).toHaveLength(0)
    })

    it('can process an empty pattern', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [],
            edgePatterns: []
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem).not.toBeNull()
        expect(outputSystem.getMicroServices()).toHaveLength(0)
    })
})
