'use strict'

const ow = require('ow')
const pRetry = require('p-retry')
const request = require('request-promise-native')

module.exports = async (opts) => {
  const {
    retries = 3,
    timeout = 30000,
    username = 'Blaise.Hansen@outlook.com',
    token = '4ea68d98e7a911be3834fd98ff8bb3c9',
    number,
    service,
    ...rest
  } = opts

  ow(number, ow.string.nonEmpty.label('number'))
  ow(service, ow.string.nonEmpty.label('service'))
  ow(opts, ow.object.plain.nonEmpty.label('opts'))

  const pid = projects.serviceToPid(service.toLowerCase())
  if (!pid) {
    throw new Error(`unrecognized service "${service}"`)
  }

  return pRetry(async () => {
    // vndo - SE Asia
    // do - china
    // usdo - usa (virtual)

    const result = await request({
      url: 'http://www.getsmscode.com/do.php',
      method: 'POST',
      qs: {
        username,
        token,
        action: 'login'
      }
    })

    const result = await request({
      url: 'http://www.getsmscode.com/do.php',
      method: 'POST',
      qs: {
        username,
        token,
        pid,
        action: 'getmobile'
      }
    })
  }, {
    retries,
    maxTimeout: timeout,
    ...rest
  })
}
