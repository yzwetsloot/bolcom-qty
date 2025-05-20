import Client from './request.js'
import logger from './service/log.js'

class Cart {
  private client: Client
  private productId: string
  private count: number

  private cartProductId: string | undefined

  constructor(client: Client, productId: string, count: number) {
    this.client = client
    this.productId = productId
    this.count = count
  }

  async add() {
    logger.debug('Add %s to cart', this.productId)

    const payload = {
      globalId: this.productId,
      quantity: 1,
      retailerOfferId: 0,
    }

    const response = await this.client.request('post', 'rnwy/basket/v2/items', { json: payload })
    if (!response) return false

    // not sold by Bol.com
    if (response.body === '' || response.statusCode === 500) {
      // not sold by Bol.com or 'Niet leverbaar'
      logger.info(`[${this.count}] %s not sold by Bol.com`, this.productId)
      return false
    }

    this.cartProductId = response.body
    return true
  }

  async update() {
    logger.debug('Update cart quantity for %s', this.productId)

    const payload = { quantity: 500 }

    const response = await this.client.request('patch', `rnwy/basket/v2/items/${this.cartProductId!}`, {
      json: payload,
    })
    if (!response) return false

    // cannot change quantity
    if (response.statusCode === 400) {
      logger.warn(`[${this.count}] Cannot change quantity of %s`, this.productId) // could be E-book
      return false
    }

    return true
  }

  async getQuantity() {
    logger.debug('Fetch cart quantity for %s', this.productId)

    const response = await this.client.request('get', 'rnwy/basket/state')
    if (!response) return

    const body = JSON.parse(response.body)

    const rows = body.itemRows

    const quantity = rows[0].quantity
    return quantity
  }

  async checkLimit() {
    logger.debug('Check cart limit for %s', this.productId)

    const response = await this.client.request('get', 'rnwy/basket/messages')
    if (!response) return

    const body = JSON.parse(response.body)

    const messages = body.messages

    for (const message of messages)
      if (
        message.messageKey === 'ITEM_QUANTITY_LIMIT_REACHED' ||
        message.messageKey === 'ITEM_QUANTITY_LIMIT_REACHED_GPC'
      )
        return true

    return false
  }
}

export default Cart
