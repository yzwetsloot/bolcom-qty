import fs from 'fs'

export const readLines = (path: string): string[] => {
  return fs
    .readFileSync(path, 'utf8')
    .toString()
    .split('\n')
    .filter((line) => line)
}

export const getRandomEntry = (items: any[]): any => {
  return items[(items.length * Math.random()) | 0]
}

export const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
