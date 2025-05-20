import { Queue } from 'modern-async'
import config from './config.js'
import Product from './ProductInterface.js'

const queue = new Queue(config.taskConcurrency) // create a queue with concurrency 3

export default async (products: Product[], worker) => {
  const tasks: Array<Promise<void>> = []
  for (const product of products) tasks.push(queue.exec(async () => await worker(product)))

  await Promise.all(tasks)
}
