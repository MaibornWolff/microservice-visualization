/**
 * A system pattern defines patterns from which nodes and edges are derived.
 * special variables allowed in all regExp attributes:
 * - $sourceRoot holds the location of the configured source folder
 */
export type SystemPattern = {
    nodePatterns: NodePattern[]
    edgePatterns: EdgePattern[]
    includedFileEndings?: string[]
    excludedFolders?: string[]
}

export type NodePattern = NamePattern & {
    /**
     * a name which describes this pattern.
     * the name is used in logs and in system model metadata.
     */
    name?: string
    /**
     * a description of this pattern
     */
    description?: string
    /**
     * the class name of the node to create. this class must exist in model/ms.ts
     * @see ../model/ms.ts
     */
    nodeType: string
}

/**
 * defines a pattern by a regular expression with a capturing group from which a name is derived.
 */
export type NamePattern = {
    /**
     * location of the search text that is used for matching the regular expression.
     */
    searchTextLocation?: SearchTextLocation
    /**
     * a variable name that the search text location is saved to. the variable can be referenced in upcoming name resolutions.
     */
    searchTextVariable?: string
    /**
     * this allows to reference a search text location from a variable defined in an earlier name pattern.
     */
    searchTextReference?: string
    /**
     * allows to define a regular expression condition that must match in order for the current file to be further inspected.
     */
    // TODO: implement
    preConditionRegExp?: string
    /**
     * a JavaScript regular expression that defines the pattern to be matched.
     * the expression must define at least one capturing group from which an intermediate name is derived.
     * this name can be referenced in further name resolutions.
     */
    regExp: string
    /**
     * the index of the capturing group to derive the name from.
     */
    // TODO: use capture group syntax instead?: (?<groupName>...)
    capturingGroupIndexForName: number
    /**
     * name of a variable which can be used in regular expressions of upcoming name resolutions in order
     * to reference the captured name
     */
    variableForName?: string
    /**
     * a name resolution translates a name that represents a variable to its value.
     * the value is discovered by another regular expression applied to the current file.
     *
     * in this case, the provided regular expression defines a pattern from which
     * the name can be resolved.
     *
     * special variables allowed:
     *  - $name can be used to refer to the node name discovered before
     *  - additional variables are available for names matched in regular expressions before
     */
    // TODO: allow multipe patterns here. when the first pattern cannot resolve the name, the next one is tried and so on
    nameResolutionPattern?: NamePattern
}

export enum SearchTextLocation {
    /**
     * absolute path of the source code file under analysis
     */
    FILE_PATH,
    /**
     * content of the source code file under analysis
     */
    FILE_CONTENT,
    /**
     * the path of any file in the source code folder
     */
    ANY_FILE_PATH,
    /**
     * the content of any file in the source code folder
     */
    ANY_FILE_CONTENT
}

/**
 * defines patterns of source and target nodes from which the nodes and edges
 * connecting them are derived. the source node pattern must match first.
 * next, the target node pattern is matched for each derived source node.
 */
export type EdgePattern = {
    sourceNodePattern: NodePattern
    targetNodePattern: NodePattern
    /**
     * the class name of the edge to create. this class must exist in model/ms.ts
     * @see ../model/ms.ts
     */
    edgeType: string
    // TODO: use name in logging + metadata
    /**
     * a name which describes this pattern.
     * the name is used in logs and in system model metadata.
     */
    name?: string
    /**
     * a description of this pattern
     */
    description?: string
}
