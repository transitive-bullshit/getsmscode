'use strict'

const ow = require('ow')
const request = require('request-promise-native')

const projects = require('./lib/projects')

const domainToSuffix = {
  usdo: 'usdo',
  vndo: 'vndo',
  'do': 'do',
  usa: 'usdo',
  us: 'usdo',
  china: 'do',
  hk: 'do',
  'asia': 'vndo',
  'seasia': 'vndo'
}

const countryCodes = new Set([
  'my', // Malaysia
  'ph', // Philippines
  'kh', // Cambodia
  'mm', // Myanmar
  'vn', // Vietnam
  'id', // Indonesia
  'hk', // Hong Kong
  'mo', // Macao
  'th', // Thailand
  'br', // Brazil
  'eg', // Egypt
  'za' // South Africa
])

/**
 * @class GetSMSCodeClient
 *
 * @param {object} [opts] - Config options
 * @param {string} [opts.username=process.env.GETSMSCODE_USERNAME] - Username for getsmscode auth
 * @param {string} [opts.token=process.env.GETSMSCODE_TOKEN] - Token for getsmscode auth
 * @param {string} [opts.domain='china'] - Domain for this client to use (china/usa/asia)
 */
class GetSMSCodeClient {
  constructor (opts = { }) {
    const {
      username = process.env.GETSMSCODE_USERNAME,
      token = process.env.GETSMSCODE_TOKEN,
      domain = 'china'
    } = opts

    ow(username, ow.string.nonEmpty.label('username'))
    ow(token, ow.string.nonEmpty.label('token'))
    ow(domain, ow.string.nonEmpty.label('domain'))
    ow(opts, ow.object.plain.nonEmpty.label('opts'))

    this._token = token
    this._username = username

    const suffix = domainToSuffix[domain]
    if (!suffix) throw new Error(`unknown getsmscode domain "${domain}"`)

    this._url = `http://www.getsmscode.com/${suffix}.php`
    this._isCountryCodeRequired = (suffix === 'vndo')
  }

  /**
   * Logs in to test auth and fetches an account summary.
   *
   * @return {Promise}
   */
  async login () {
    const result = await this._request('login')

    const [ username, balance, points ] = result.split('|')
    return {
      username,
      balance,
      points
    }
  }

  /**
   * Acquires a temporary handle on a mobile number usable for the given service.
   *
   * You must specify either `opts.service` or `opts.pid`.
   *
   * @param {object} opts - Config options
   * @param {string} [opts.service] - Name of service to blacklist number
   * @param {string} [opts.pid] - Project ID of service to blacklist number
   * @param {string} [opts.cocode] - Country code (required if using asian domain)

   * @return {Promise}
   */
  async getNumber (opts) {
    const {
      service,
      pid = projects.serviceToPID[service.toLowerCase()],
      cocode
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    if (this._isCountryCodeRequired) {
      if (!cocode) throw new Error('cocode required')
      if (!countryCodes.has(cocode)) throw new Error(`invalid cocode "${cocode}"`)
    }

    const result = await this._request('getmobile', { pid, cocode })

    if (result.indexOf('|') >= 0) {
      throw new Error(result)
    }

    return result
  }

  /**
   * Returns a list of `{ number, service }` objects currently in use by this account.
   *
   * @return {Promise}
   */
  async getNumbers () {
    const numbers = await this._request('mobilelist')

    return numbers.split(',')
      .map((o) => {
        const [ number, pid ] = o.split('|')
        const service = projects.pidToService[pid]

        return { number, service }
      })
  }

  /**
   *
   * You must specify either `opts.service` or `opts.pid`.
   *
   * @param {object} opts - Config options
   * @param {string} opts.number - Mobile number to blacklist
   * @param {string} [opts.service] - Name of service to blacklist number
   * @param {string} [opts.pid] - Project ID of service to blacklist number
   * @param {string} [opts.cocode] - Country code (required if using asian domain)

   * @return {Promise}
   */
  async getSMS (opts) {
    const {
      number,
      service,
      pid = projects.serviceToPID[service.toLowerCase()],
      cocode
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    if (this._isCountryCodeRequired) {
      if (!cocode) throw new Error('cocode required')
      if (!countryCodes.has(cocode)) throw new Error(`invalid cocode "${cocode}"`)
    }

    const result = await this._request('getsms', { mobile: number, pid, cocode })

    if (result.startsWith('1|')) {
      return result.slice(2)
    }

    return result
  }

  /**
   * Adds a number to this account's blacklist for the given service.
   *
   * You must specify either `opts.service` or `opts.pid`.
   *
   * @param {object} opts - Config options
   * @param {string} opts.number - Mobile number to blacklist
   * @param {string} [opts.service] - Name of service to blacklist number
   * @param {string} [opts.pid] - Project ID of service to blacklist number
   * @param {string} [opts.cocode] - Country code (required if using asian domain)
   *
   * @return {Promise}
   */
  async addNumberToBlacklist (opts) {
    const {
      number,
      service,
      pid = projects.serviceToPID[service.toLowerCase()],
      cocode
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    if (this._isCountryCodeRequired) {
      if (!cocode) throw new Error('cocode required')
      if (!countryCodes.has(cocode)) throw new Error(`invalid cocode "${cocode}"`)
    }

    return this._request('getsms', { mobile: number, pid, cocode })
  }

  _request (action, params = { }) {
    if (!this._isCountryCodeRequired) {
      delete params.cocode
    }

    return request({
      method: 'POST',
      url: this._url,
      qs: {
        action,
        username: this._username,
        token: this._token,
        ...params
      }
    })
  }
}

module.exports = GetSMSCodeClient
