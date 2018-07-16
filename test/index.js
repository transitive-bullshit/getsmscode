'use strict'

const { test } = require('ava')
// const validator = require('validator')

const GetSMSCodeClient = require('..')

test('getNumber chinese', async (t) => {
  const client = new GetSMSCodeClient({
    username: 'test-username',
    token: 'test-token'
  })
  t.truthy(typeof client.getNumber === 'function')

  // const number = await client.getNumber({ service: 'microsoft' })
  // t.truthy(validator.isMobilePhone(number, [ 'zh-CN', 'zh-HK' ]))
})
