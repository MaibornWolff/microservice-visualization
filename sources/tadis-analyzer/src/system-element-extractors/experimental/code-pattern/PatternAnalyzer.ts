import * as fs from 'fs'
import * as path from 'path'
import * as immer from 'immer'
import { findFilesSafe } from '../../../utils/files/analysis'
import { SystemPattern, NodePattern, EdgePattern, SearchTextLocation, NamePattern } from './model'
import { Logger } from '@nestjs/common'
import { System } from '../../../model/ms'

// tslint:disable-next-line
import * as ms from '../../../model/ms'

import { Metadata } from '../../../model/core'

/**
 * The PatternAnalyzer allows to derive a system from source code patterns defined by regular expressions.
 */
export class PatternAnalyzer {
    constructor(public readonly sourceFolder: string) {}

    public async transform(system: System, systemPattern: SystemPattern): Promise<System> {
        const systemPatternWithoutVariables = replaceVariablesInPatterns(systemPattern, this.sourceFolder)
        await transformSystemFromPattern(system, systemPatternWithoutVariables, this.sourceFolder)
        return system
    }
}

function replaceVariablesInPatterns(systemPattern: SystemPattern, sourceFolder: string): SystemPattern {
    return immer.produce(systemPattern, (systemPatternDraft) => {
        systemPatternDraft.nodePatterns.forEach((pattern) => {
            pattern.regExp = replaceGlobalVariablesInRegExp(pattern.regExp, sourceFolder)
            if (pattern.nameResolutionPattern) {
                pattern.nameResolutionPattern.regExp = replaceGlobalVariablesInRegExp(
                    pattern.nameResolutionPattern.regExp,
                    sourceFolder
                )
            }
        })

        systemPatternDraft.edgePatterns.forEach((pattern) => {
            pattern.sourceNodePattern.regExp = replaceGlobalVariablesInRegExp(
                pattern.sourceNodePattern.regExp,
                sourceFolder
            )
            pattern.targetNodePattern.regExp = replaceGlobalVariablesInRegExp(
                pattern.targetNodePattern.regExp,
                sourceFolder
            )
        })
    })
}

function replaceGlobalVariablesInRegExp(regExp: string, sourceFolder: string) {
    return regExp.replace('$sourceRoot', path.resolve(sourceFolder))
}

async function transformSystemFromPattern(system: System, systemPattern: SystemPattern, sourceFolder: string) {
    Logger.log('scanning all files in ' + sourceFolder)
    const allFiles = await findFilesSafe(sourceFolder, systemPattern.includedFileEndings, systemPattern.excludedFolders)
    Logger.log('found ' + allFiles.length + ' files')

    allFiles.forEach((filePath) => {
        systemPattern.nodePatterns.forEach((nodePattern) =>
            addNodesFromPattern(system, nodePattern, filePath, allFiles)
        )

        systemPattern.edgePatterns.forEach((edgePattern) =>
            addEdgesFromPattern(system, edgePattern, filePath, allFiles, sourceFolder)
        )
    })
}

function addNodesFromPattern(system: System, nodePattern: NodePattern, filePath: string, allFiles: string[]) {
    findNodes(nodePattern, filePath, allFiles, new NameMemory(), new Map()).forEach((node) => {
        const nodeName = node.nodeName
        system.addOrExtendTypedNode(nodePattern.nodeType, nodeName)
        Logger.log(`added node '${nodeName}'`)
    })
}

function addEdgesFromPattern(
    system: System,
    edgePattern: EdgePattern,
    filePath: string,
    allFiles: string[],
    sourceFolder: string
) {
    const initialNameMemory = new NameMemory()
    // TODO: also add to NodePattern
    initialNameMemory.saveName('sourceRoot', sourceFolder)
    findNodes(edgePattern.sourceNodePattern, filePath, allFiles, initialNameMemory, new Map()).forEach((sourceNode) => {
        const sourceNodeName = sourceNode.nodeName
        if (sourceNodeName) {
            Logger.log(`found source node '${sourceNodeName}'`)

            findNodes(
                edgePattern.targetNodePattern,
                filePath,
                allFiles,
                sourceNode.nameMemory,
                sourceNode.searchTextLocationMemory
            ).forEach((targetNode) => {
                const targetNodeName = targetNode.nodeName
                if (targetNode) {
                    Logger.log(`found target node '${targetNodeName}'`)
                    createEdgeOnce(system, edgePattern, sourceNodeName, targetNodeName)
                }
            })
        }
    })
}

function createEdgeOnce(system: System, edgePattern: EdgePattern, sourceNodeName: string, targetNodeName: string) {
    if (
        system
            .getAllEdges()
            .find((edge) => edge.source.getName() === sourceNodeName && edge.target.getName() === targetNodeName)
    ) {
        Logger.log(
            `skipping already existing edge '${sourceNodeName}' --(${edgePattern.edgeType})--> '${targetNodeName}'`
        )
        return
    }

    const metadata: Metadata = {
        transformer: PatternAnalyzer.name,
        context: `edge pattern with source node '${sourceNodeName}'`,
        info: `matched target node '${targetNodeName}'`
    }

    const sourceNode = system.addOrExtendTypedNode(
        edgePattern.sourceNodePattern.nodeType,
        sourceNodeName,
        null,
        metadata
    )

    const targetNode = system.addOrExtendTypedNode(
        edgePattern.targetNodePattern.nodeType,
        targetNodeName,
        null,
        metadata
    )

    const edge = new ms[edgePattern.edgeType](sourceNode, targetNode, undefined, metadata)
    system.edges.push(edge)

    Logger.log(`added edge '${sourceNodeName}' --(${edgePattern.edgeType})--> '${targetNodeName}'`)
}

/**
 * a node which was matched from a pattern including all matched names.
 */
class MatchedNode {
    constructor(
        public readonly nodeName: string,
        public readonly nameMemory: NameMemory,
        public searchTextLocationMemory: Map<string, string> = new Map()
    ) {}
}

/**
 * a memory of all the names found during a chain of pattern matchings.
 */
class NameMemory {
    private readonly names: Map<string, string>

    constructor(public readonly inheritedNameMemory?: NameMemory) {
        this.names = new Map()
    }

    saveName(name: string, value: string) {
        this.names.set(name, value)
    }

    getCurrentNames(): Map<string, string> {
        return this.names
    }

    findName(name: string): string | undefined {
        const directName = this.names.get(name)
        if (!directName && this.inheritedNameMemory) return this.inheritedNameMemory.findName(name)
        return undefined
    }

    toString(): string {
        let result = ''
        for (const entry of this.names.entries()) {
            result += entry[0] + ': ' + entry[1] + '\n'
        }
        return result + (this.inheritedNameMemory ? this.inheritedNameMemory.toString() : '')
    }
}

// TODO: add individual tests
function findNodes(
    pattern: NodePattern,
    filePath: string,
    allFiles: string[],
    nameMemory: NameMemory,
    searchTextLocationMemory: Map<string, string>
): MatchedNode[] {
    const matchedNodes = matchNode(pattern, filePath, nameMemory)

    if (!pattern.nameResolutionPattern) return matchedNodes
    const nameResolution = pattern.nameResolutionPattern

    if (pattern.searchTextVariable !== undefined) {
        matchedNodes.forEach((node) => {
            Logger.log('Saving search text location to variable ' + pattern.searchTextVariable + ' = ' + filePath)
            node.searchTextLocationMemory = searchTextLocationMemory
            searchTextLocationMemory.set(pattern.searchTextVariable, filePath)
        })
    }

    return matchedNodes.map((node) => {
        const foundNames = new NameMemory(nameMemory)
        const nameVariable = getVariableForName(pattern.variableForName)
        foundNames.saveName(nameVariable, node.nodeName)
        const resolvedName = resolveName(nameResolution, filePath, allFiles, foundNames, searchTextLocationMemory)
        if (!resolvedName) {
            Logger.warn(`could not resolve name '${node.nodeName}'`)
            Logger.warn(`current regexp: '${nameResolution.regExp}'`)
            return new MatchedNode(node.nodeName, foundNames)
        }
        Logger.log(
            `resolved node with name '${
                node.nodeName
            }' to actual name '${resolvedName}'.\ncurrent name memory\n---\n${foundNames.toString()}`
        )
        return new MatchedNode(resolvedName, foundNames)
    })
}

function getVariableForName(variableForName: string | undefined): string {
    return variableForName ?? 'name'
}

interface Content {
    read(): string
    filePath(): string
}

class FileContent implements Content {
    constructor(private readonly file: string) {}
    read(): string {
        return fs.readFileSync(this.file, 'utf8')
    }
    filePath(): string {
        return this.file
    }
}

class PathContent implements Content {
    constructor(private readonly path: string) {}
    read(): string {
        return this.path
    }
    filePath(): string {
        return this.path
    }
}

/**
 * resolves a final name by traversing a chain of name resolution patterns.
 * when the end of the chain is reached, the name is either resolved and returned or undefined.
 * when traversing the chain, each matched name is added to the matchedNames map
 * and it may be referenced by its variable name in the next chain elements.
 *
 * @param nameResolution the name resolution pattern used for resolving the name
 * @param filePath the current file to be searched in
 * @param allFiles list of all files which are used in the search
 * @param foundNames map of names found by matching regular expressions in name resolution chains so far
 */
// TODO: add individual tests
function resolveName(
    nameResolution: NamePattern,
    filePath: string,
    allFiles: string[],
    foundNames: NameMemory,
    searchTextLocationMemory: Map<string, string>
): string | undefined {
    const regExp = replaceNameVariables(nameResolution.regExp, foundNames)

    const contents = getContentsToResolveNameFrom(nameResolution, filePath, allFiles, searchTextLocationMemory)
    for (const content of contents) {
        const resolvedNames = matchNodeByRegExp(
            nameResolution.preConditionRegExp,
            regExp,
            content.read(),
            1,
            nameResolution.variableForName,
            foundNames
        )
        if (resolvedNames.length > 0) {
            const resolvedName = resolvedNames[0]
            searchTextLocationMemory.set(nameResolution.searchTextVariable, content.filePath())
            Logger.log(
                'Saving search text location to variable ' +
                    nameResolution.searchTextVariable +
                    ' = ' +
                    content.filePath()
            )
            if (resolvedNames.length >= 2) {
                const allNames = resolvedNames.map((node) => node.nodeName).join(', ')
                Logger.warn(
                    'name resolution returned with multiple possible names. choosing first name from list: ' + allNames
                )
            }

            const nameVariable = getVariableForName(nameResolution.variableForName)
            foundNames.saveName(nameVariable, resolvedName.nodeName)

            if (!nameResolution.nameResolutionPattern) {
                // TODO: add metadata to node for debugging
                Logger.log(
                    `resolved name '${resolvedName}' in file ${content.filePath()} using pattern ${
                        nameResolution.regExp
                    }`
                )
                return resolvedName.nodeName
            } else {
                // continue with next resolution pattern
                const nextFilePath = shouldSearchInPath(nameResolution) ? content.filePath() : filePath

                Logger.log(
                    `continue to resolve name in file '${nextFilePath}' using pattern '${nameResolution.regExp}'`
                )
                const resolvedName = resolveName(
                    nameResolution.nameResolutionPattern,
                    nextFilePath,
                    allFiles,
                    foundNames,
                    searchTextLocationMemory
                )
                if (resolvedName) {
                    // TODO: add metadata to node for debugging
                    Logger.log(
                        `resolved name '${resolvedName}' in file ${content.filePath()} using pattern ${
                            nameResolution.regExp
                        }`
                    )
                    return resolvedName
                }
            }
        }
    }
    return undefined
}

function shouldSearchInPath(namePattern: NamePattern): boolean {
    return (
        namePattern.searchTextLocation === SearchTextLocation.FILE_PATH ||
        namePattern.searchTextLocation === SearchTextLocation.ANY_FILE_PATH ||
        namePattern.searchTextReference !== undefined
    )
}

function replaceNameVariables(regExp: string, nameMemory: NameMemory): string {
    for (const variable of nameMemory.getCurrentNames().entries()) {
        regExp = regExp.replace('$' + variable[0], variable[1])
    }
    if (nameMemory.inheritedNameMemory) {
        regExp = replaceNameVariables(regExp, nameMemory.inheritedNameMemory)
    }
    return regExp
}

function getContentsToResolveNameFrom(
    nameResolution: NamePattern,
    filePath: string,
    allFiles: string[],
    searchTextLocationMemory: Map<string, string>
): Content[] {
    if (nameResolution.searchTextLocation === SearchTextLocation.FILE_PATH) {
        return [new PathContent(filePath)]
    } else if (nameResolution.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
        return [new FileContent(filePath)]
    } else if (nameResolution.searchTextLocation === SearchTextLocation.ANY_FILE_CONTENT) {
        return allFiles.map((file) => new FileContent(file))
    } else if (nameResolution.searchTextLocation === SearchTextLocation.ANY_FILE_PATH) {
        return allFiles.map((file) => new PathContent(file))
    } else if (nameResolution.searchTextReference !== undefined) {
        const searchTextLocation = searchTextLocationMemory.get(nameResolution.searchTextReference)
        Logger.log('Using referenced search text location: ' + searchTextLocation)
        if (!searchTextLocation) {
            throw new Error(
                'Cannot find saved search text location for reference "' + nameResolution.searchTextReference + '"'
            )
        }
        return [new FileContent(searchTextLocation)]
    } else {
        return []
    }
}

// TODO: add individual tests
function matchNode(pattern: NodePattern, filePath: string, nameMemory: NameMemory): MatchedNode[] {
    if (shouldSearchInPath(pattern)) {
        return matchNodeByPattern(pattern, filePath, nameMemory)
    }
    if (pattern.searchTextLocation === SearchTextLocation.FILE_CONTENT) {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        return matchNodeByPattern(pattern, fileContent, nameMemory)
    }
    return []
}

function matchNodeByPattern(pattern: NodePattern, searchText: string, nameMemory: NameMemory): MatchedNode[] {
    const variableForName = getVariableForName(pattern.variableForName)
    return matchNodeByRegExp(
        pattern.preConditionRegExp,
        pattern.regExp,
        searchText,
        pattern.capturingGroupIndexForName,
        variableForName,
        nameMemory
    )
}

function matchNodeByRegExp(
    preConditionRegExpString: string | undefined,
    regExpString: string,
    searchText: string,
    capturingGroupIndexForName: number,
    variableForName: string,
    inheritedNameMemory: NameMemory
): MatchedNode[] {
    if (preConditionRegExpString) {
        const preConditionRegExpWithReplacedVariables = replaceNameVariables(
            preConditionRegExpString,
            inheritedNameMemory
        )
        const preConditionRegExp = new RegExp(preConditionRegExpWithReplacedVariables, 'g')

        if (searchText.match(preConditionRegExp) == null) {
            return []
        }
    }

    const regExpWithReplacedVariables = replaceNameVariables(regExpString, inheritedNameMemory)
    const regExp = new RegExp(regExpWithReplacedVariables, 'g')

    return getAllPatternMatches<MatchedNode>(regExp, searchText, (matchArray: RegExpExecArray) => {
        if (matchArray.length >= capturingGroupIndexForName) {
            const name = matchArray[capturingGroupIndexForName]
            Logger.log(`matched name '${name}' from regexp '${regExpWithReplacedVariables}'`)
            const nameMemory = new NameMemory(inheritedNameMemory)
            nameMemory.saveName(variableForName, name)
            return new MatchedNode(name, nameMemory)
        }
        return null
    })
}

function getAllPatternMatches<MatchType>(
    pattern: RegExp,
    content: string,
    matchTransformer: (matchArray: RegExpExecArray) => MatchType | null
): MatchType[] {
    const allMatches: MatchType[] = []

    let matches = pattern.exec(content)
    while (matches !== null) {
        const capturedValue = matchTransformer(matches)
        if (capturedValue) {
            allMatches.push(capturedValue)
        }
        matches = pattern.exec(content)
    }

    return allMatches
}
