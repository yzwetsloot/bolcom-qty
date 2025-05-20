import db from './service/database.js'
import config from './config.js'
import { shuffle } from './util.js'
import logger from './service/log.js'
import Product from './ProductInterface.js'

const interval = config.dateRange

/**
 * Get ID's & quantity limit flags from products (modified in last `interval` days) from database.
 *
 * @returns {Promise<Product[]>} Array of object literals with product ID's and quantity limit flags
 * @async
 */
export const getProducts = async (): Promise<Product[]> => {
  const { rows } = await db.query(
    `SELECT id, has_quantity_limit FROM product WHERE id IN (SELECT DISTINCT id FROM price WHERE modified_at >= NOW() - INTERVAL '${interval}' DAY)`,
  )

  const products: Product[] = rows
  shuffle(products)

  return products
}

/**
 * Updates quantity of product in database.
 *
 * @param {string} productId Product ID
 * @param {number} quantity Quantity of product
 * @async
 */
export const updateQuantity = async (productId: string, quantity: number) => {
  const { rows } = await db.query('SELECT value FROM quantity WHERE id = $1 ORDER BY modified_at DESC LIMIT 1', [
    productId,
  ])

  if (rows.length === 0 || rows[0].value !== quantity) {
    // if quantity differs, or no quantity yet, insert new quantity
    db.query('INSERT INTO quantity (id, value, weight) VALUES ($1, $2, $3)', [productId, quantity, 1])
      .then(() => logger.debug('Set quantity %s to %d', productId, quantity))
      .catch((error: Error) => logger.error('Insert (%d) %s failed: %s', quantity, productId, error))
  } else {
    // if quantity is the same, update modified_at and increase weight
    db.query(
      'UPDATE quantity SET weight = quantity.weight + 1 WHERE id = $1 AND created_at = (SELECT created_at FROM quantity WHERE id = $1 ORDER BY modified_at DESC LIMIT 1)',
      [productId],
    )
      .then(() => logger.debug('Set quantity %s to %d', productId, quantity))
      .catch((error: Error) => logger.error('Update (%d) %s failed: %s', quantity, productId, error))
  }
}

/**
 * Set limit flag of product in database.
 *
 * @async
 */
export const setLimit = async (productId: string, limit: boolean) => {
  await db
    .query('UPDATE product SET has_quantity_limit = $1 WHERE id = $2', [limit, productId])
    .then(() => logger.debug(limit ? 'Set limit for %s' : 'Unset limit for %s', productId))
    .catch((error: Error) => logger.error('Failed to set limit for %s: %s', productId, error))
}
