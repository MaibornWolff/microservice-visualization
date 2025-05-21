import * as data from './model.js'

interface NamePattern extends data.NamePattern {
  resolveNameFromId(id: string, filePath: string, allFiles: string[]): string
}
