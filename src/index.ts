import duration from 'humanize-duration'
import { getProducts, updateQuantity, setLimit } from './query.js'
import Client from './request.js'
import Cart from './cart.js'
import logger from './service/log.js'
import queueTasks from './workerQueue.js'
import { sleep } from 'modern-async'
import Product from './ProductInterface.js'

let count = 0

const main = async () => {
  const start = new Date()

  const products = await getProducts()

  logger.info('Start scraping %d quantities', products.length)

  await queueTasks(products, worker)

  logger.info('Scraping %d quantities took %s', count, duration(new Date().getTime() - start.getTime()))
}

const worker = async (product: Product) => {
  const id = ++count

  logger.debug('Get quantity for %s', product.id)

  const start = new Date()

  const client = new Client()
  const cart = new Cart(client, product.id, id)

  let ok = await cart.add()
  if (!ok) return

  await sleep(500)

  ok = await cart.update()
  if (!ok) return

  const quantity = await cart.getQuantity()
  if (!quantity) return

  logger.info(`[${id}] Got ${quantity} for ${product.id} (${duration(new Date().getTime() - start.getTime())})`)

  updateQuantity(product.id, quantity)

  const limit = await cart.checkLimit()
  if (limit !== undefined && limit !== product.has_quantity_limit) setLimit(product.id, limit)
}

await main().catch(async (e) => {
  logger.error('Unhandled rejection: %s', e.stack ?? e.message ?? e)
})
