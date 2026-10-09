const { jsx } = require('react/jsx-runtime')

// A third-party (ignore-listed) component that reads the current time.
function LibClock() {
  return jsx('p', { children: 'now: ' + Date.now() })
}

module.exports = { LibClock }
