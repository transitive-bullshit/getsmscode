# getsmscode

> API client for [getsmscode.com](http://www.getsmscode.com/)

[![NPM](https://img.shields.io/npm/v/getsmscode.svg)](https://www.npmjs.com/package/getsmscode) [![Build Status](https://travis-ci.org/transitive-bullshit/getsmscode.svg?branch=master)](https://travis-ci.org/transitive-bullshit/getsmscode) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

- meant for automated systems that need to bypass SMS number verification
- handles hundreds of known services (wechat, google, facebook, whatsapp, uber, twitter, etc...)

## Install

This module requires `node >= 8`.

```bash
npm install --save getsmscode
```

## Usage

```js
const Client = require('getsmscode')

const client = new Client({
  username: '...',
  token: '...'
})

const number = await client.getNumber({
  service: 'google'
})

const sms = await client.getSMS({
  service: 'google',
  number: number
})
```

## API

**TODO**

## Todo

## Related

- [parse-otp-message](https://github.com/transitive-bullshit/parse-otp-message) - Parses OTP messages for a verification code and service provider.
- [sms-number-verifier](https://github.com/transitive-bullshit/) - Allows you to spoof SMS number verification.

## Disclaimer

Using this software to violate the terms and conditions of any third-party service is strictly against the intent of this software. By using this software, you are acknowledging this fact and absolving the author or any potential liability or wrongdoing it may cause. This software is meant for testing and experimental purposes only, so please act responsibly.

## License

MIT © [Travis Fischer](https://github.com/transitive-bullshit)
