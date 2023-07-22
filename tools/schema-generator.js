// main.js

const tsj = require('ts-json-schema-generator')
const glob = require('glob')
const fs = require('fs')
const path = require('path')

const directoryPath = path.resolve(__dirname, '../src/components') // Replace with the actual path to your directory
const pattern = '**/*.schema.ts'

const generateSchema = (inputFile, outputFile) => {
  /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
  const config = {
    path: inputFile,
    tsconfig: path.resolve(__dirname, '../tsconfig.json'),
    type: '*'
  }

  const output_path = path.resolve(outputFile)

  const schema = tsj.createGenerator(config).createSchema(config.type)
  const schemaString = JSON.stringify(schema, null, 2)
  fs.writeFile(output_path, schemaString, err => {
    if (err) throw err
  })
}

// Function to find all files matching the pattern in a directory and its subdirectories
function findFilesWithPattern (directoryPath, pattern) {
  const options = {
    cwd: directoryPath,
    ignore: ['node_modules/**'], // Optional: Exclude node_modules directory from the search
    nodir: true, // Only include files, not directories
    absolute: true // Return absolute paths
  }

  return new Promise((resolve, reject) => {
    glob(pattern, options, (error, files) => {
      if (error) {
        reject(error)
      } else {
        resolve(files)
      }
    })
  })
}

const init = () => {
  findFilesWithPattern(directoryPath, pattern)
    .then(files => {
      console.log('Matching files:', files)
      files.forEach(file => generateSchema(file, file.replace('.ts', '.json')))
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

init()
