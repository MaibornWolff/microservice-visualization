import { System, AsyncEventFlow } from '../../../model/ms'

import { verifyEachContentHasTransformer } from '../../../test/verifiers'

import { PatternAnalyzer } from './PatternAnalyzer'
import { SystemPattern, NodePattern, SearchTextLocation } from './model'

describe('PatternAnalyzer.multiFile', () => {
    const sourceFolder = __dirname + '/testdata/multi-file-analysis-project'

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
            variableForName: 'serviceName',
            nodeType: 'MicroService'
        }
    }

    it('can resolve a name from the content of another file', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [],
            edgePatterns: [
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: javaSourceFilePattern(),
                    targetNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        regExp: `"(.+_KAFKA_TOPIC)"`,
                        capturingGroupIndexForName: 1,
                        variableForName: 'envName',
                        nameResolutionPattern: {
                            searchTextLocation: SearchTextLocation.ANY_FILE_PATH,
                            regExp: `service1/config\.yml`,
                            capturingGroupIndexForName: 1,
                            nameResolutionPattern: {
                                searchTextLocation: SearchTextLocation.FILE_CONTENT,
                                regExp: `name:\\s*$envName\\s*value:\\s*(\\w+)`,
                                capturingGroupIndexForName: 1
                            }
                        },
                        nodeType: 'MessageExchange'
                    }
                }
            ]
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.getAllEdges()).toHaveLength(2)
        expect(outputSystem.findMicroService('service1')).toBeDefined()
        expect(outputSystem.findMessageExchange('actual_topic_1')).toBeDefined()
        expect(outputSystem.findMessageExchange('actual_topic_2')).toBeDefined()

        verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
    })

    it('can reference a source location from a variable in a stack of name resolutions', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            nodePatterns: [],
            edgePatterns: [
                {
                    edgeType: 'AsyncEventFlow',
                    sourceNodePattern: javaSourceFilePattern(),
                    targetNodePattern: {
                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                        searchTextVariable: 'javaSourceFile', // --> writes source location to variable
                        regExp: `\\.stream\\(([\\w^"]+)[\\),]`,
                        capturingGroupIndexForName: 1,
                        variableForName: 'topicJavaVariable',
                        nodeType: 'MessageExchange',
                        nameResolutionPattern: {
                            searchTextLocation: SearchTextLocation.FILE_PATH,
                            regExp: `$sourceRoot/([^/]+)/`,
                            capturingGroupIndexForName: 1,
                            variableForName: 'serviceName', // --> saves serviceName to variable
                            nameResolutionPattern: {
                                searchTextReference: 'javaSourceFile', // --> reads source location from variable
                                regExp: `ConfigProperty\\(name = "([\\w_]+)"\\)[^;]+?$topicJavaVariable;`,
                                capturingGroupIndexForName: 1,
                                variableForName: 'topicEnvVariable',
                                nameResolutionPattern: {
                                    searchTextLocation: SearchTextLocation.ANY_FILE_PATH,
                                    regExp: `$serviceName/config\\.yml`, // --> reads serviceName from variable
                                    capturingGroupIndexForName: 1,
                                    nameResolutionPattern: {
                                        searchTextLocation: SearchTextLocation.FILE_CONTENT,
                                        regExp: `name:\\s*$topicEnvVariable\\s*value:\\s*(\\w+)`,
                                        capturingGroupIndexForName: 1
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        // console.log(JSON.stringify(outputSystem, null, 2))

        expect(outputSystem.getAllEdges()).toHaveLength(2)
        expect(outputSystem.findMicroService('service1')).toBeDefined()
        expect(outputSystem.findMessageExchange('actual_topic_1')).toBeDefined()
        expect(outputSystem.findMessageExchange('actual_topic_2')).toBeDefined()

        verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
    })

    it('only searches in files matching the file mask and not in excluded folders', async () => {
        const inputSystem = new System('test')

        const systemPattern: SystemPattern = {
            includedFileEndings: ['.yml'],
            excludedFolders: ['excluded'],
            nodePatterns: [
                {
                    searchTextLocation: SearchTextLocation.FILE_PATH,
                    regExp: '$sourceRoot/([^/]+)/.*',
                    capturingGroupIndexForName: 1,
                    variableForName: 'serviceName',
                    nodeType: 'MicroService'
                }
            ],
            edgePatterns: []
        }

        const analyzer = new PatternAnalyzer(sourceFolder)
        const outputSystem = await analyzer.transform(inputSystem, systemPattern)

        expect(outputSystem.getMicroServices()).toHaveLength(1)
    })
})
