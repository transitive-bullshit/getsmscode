'use strict'

const { test } = require('ava')
const validator = require('validator')

const GetSMSCodeClient = require('..')

test('getNumber', async (t) => {
  const client = new GetSMSCodeClient({
    username: 'Blaise.Hansen@outlook.com',
    token: '4ea68d98e7a911be3834fd98ff8bb3c9'
  })
  const number = await client.getNumber({ service: 'microsoft' })

  t.truthy(validator.isMobilePhone(number, [ 'zh-CN', 'zh-HK' ]))
})
