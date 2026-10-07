const inspector = require('inspector')
const fs = require('fs')
const session = new inspector.Session()
session.connect()
session.post('Profiler.enable', () => {
  session.post('Profiler.setSamplingInterval', { interval: 100 }, () => {})
})
function stop(tag) {
  session.post('Profiler.stop', (err, { profile } = {}) => {
    if (profile) {
      const f = `./profiles/${tag}-${process.pid}.cpuprofile`
      fs.writeFileSync(f, JSON.stringify(profile))
      console.log('WROTE PROFILE', f)
    }
  })
}
process.on('SIGUSR1', () => session.post('Profiler.start', () => console.log('PROFILE STARTED', process.pid)))
process.on('SIGUSR2', () => stop('prof'))
