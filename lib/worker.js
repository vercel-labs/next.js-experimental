import { doWork } from './work.js'

self.onmessage = (e) => {
  self.postMessage(doWork(e.data))
}
