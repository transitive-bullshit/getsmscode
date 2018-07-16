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
  }

  async login () {
    return this._request('login')
  }

  async getNumber (opts) {
    const {
      service,
      pid = projects.serviceToPID[service.toLowerCase()]
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    return this._request('getmobile', { pid })
  }

  async getNumbers () {
    const numbers = await this._request('mobilelist')

    return numbers.split(',')
      .map((o) => {
        const [ number, pid ] = o.split('|')
        const service = projects.pidToService[pid]

        return { number, service }
      })
  }

  async getSMS (opts) {
    const {
      number,
      service,
      pid = projects.serviceToPID[service.toLowerCase()]
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    const result = await this._request('getsms', { mobile: number, pid })

    if (result.startsWith('1|')) {
      return result.slice(2)
    }

    return result
  }

  async addNumberToBlacklist (opts) {
    const {
      number,
      service,
      pid = projects.serviceToPID[service.toLowerCase()]
    } = opts

    if (!pid) throw new Error(`unrecognized service "${service}"`)
    return this._request('getsms', { mobile: number, pid })
  }

  _request (action, params = { }) {
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
