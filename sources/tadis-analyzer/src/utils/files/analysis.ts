import * as fs from 'fs'
import * as p from 'path'

/**
 * searches for all files in the given path recursively
 * and filters for given file ending.
 *
 * @param path
 * @param fileEnding
 */
export async function findFiles(path: string, includedFileEndings: string[] | undefined, excludedFolders: string[] | undefined) {
  const files: string[] = []
  await getFilesRecursive(path, files, includedFileEndings, excludedFolders)
  return files
}

/**
 * searches for all files in the given path recursively
 * and filters for given file ending.
 * ignores files which belong to the source of this software
 * iff the software is not invoked from a unit test.
 *
 * @param path
 * @param fileEnding
 */
export async function findFilesSafe(path: string,
                                    includedFileEndings: string[] | undefined,
                                    excludedFolders: string[] | undefined): Promise<string[]> {

  const allFiles = await findFiles(path, includedFileEndings, excludedFolders)
  // tslint:disable-next-line: deprecation - its ok for this file to use the method.
  return allFiles.filter(file => isNoSourceOfThisProject(file))
}

async function getFilesRecursive(path, allFiles,
  includedFileEndings: string[] | undefined, excludedFolders: string[] | undefined) {

  const entries = await getDirectoryEntries(path)

  for (const entry of entries) {
    const entryWithPath = p.resolve(path, entry)
    if (!fs.statSync(entryWithPath).isDirectory()
      && (!includedFileEndings || fileHasAnyEnding(entry, includedFileEndings))) {
      allFiles.push(entryWithPath)
    }

    if (fs.statSync(entryWithPath).isDirectory() && folderIsNotExcluded(entry, excludedFolders)) {
      await getFilesRecursive(entryWithPath, allFiles, includedFileEndings, excludedFolders)
    }
  }

  return true
}

function folderIsNotExcluded(folder: string, excludedFolders: string[] | undefined): boolean {
  return !excludedFolders || !excludedFolders.includes(folder)
}

function fileHasAnyEnding(file: string, includedFileEndings: string[] | undefined): boolean {
  return includedFileEndings.find(ending => file.endsWith(ending)) !== undefined
}

function getDirectoryEntries(path): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(files)
      }
    })
  })
}

/** extracts the service name of a file in the source path.
 * the service name will be the name of the folder that is directly contained in the source path.
 */
export function getServiceNameFromPath(sourcePath, file) {
  const absoluteSourcePath = p.resolve(sourcePath)
  const absoluteFilePath = p.resolve(file)
  const strippedPath = absoluteFilePath.slice(absoluteSourcePath.length + 1)
  return strippedPath.slice(0, strippedPath.indexOf('/'))
}

/**
 * returns true if either the given file does not belong to this software
 * or this method was called from a unit test.
 *
 * @param file
 * @deprecated use findFilesSafe() instead
 */
export function isNoSourceOfThisProject(file) {
  const thisProjectsSourceFolder = p.resolve(process.cwd(), 'src')
  return !file.toLowerCase().includes(thisProjectsSourceFolder.toLowerCase()) || process.env.NODE_ENV === 'test'
}
