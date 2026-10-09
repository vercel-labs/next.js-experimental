'use strict'
const { jsx } = require('react/jsx-runtime')
function Clock() {
  return jsx('p', { children: 'now: ' + Date.now() })
}
module.exports = { Clock }
