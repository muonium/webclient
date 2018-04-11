import moment from 'moment'
import base64 from 'hi-base64'

class Utils {
  constructor () {
    this.t = null // Language JSON set in App.vue
    this.hash = typeof __webpack_hash__ !== 'undefined' ? __webpack_hash__ : null // eslint-disable-line no-undef, camelcase
    if (this.hash === null) {
      let appSrc = document.querySelector('script[src*="/static/js/app."]')
      if (appSrc && appSrc.src !== undefined) {
        let m = appSrc.src.match(/\/static\/js\/app\.(.+)\.js/)
        if (typeof m[1] !== 'undefined') {
          this.hash = m[1]
        }
      }
    }
  }

  getDate (timestamp) {
    let format = 'YYYY-MM-DD HH:mm'
    if (this.t !== null && typeof this.t.Dates !== 'undefined' && typeof this.t.Dates.date !== 'undefined' && typeof this.t.Dates.time !== 'undefined') {
      format = this.t.Dates.date + ' ' + this.t.Dates.time
    }
    return moment(timestamp * 1000).format(format)
  }

  showSize (size, precision = 2) { // size => size in bytes
    size = parseInt(size)
    if (isNaN(size) || size <= 0) {
      return 0
    }
    if (this.t === null || typeof this.t.Units === 'undefined') {
      return size
    }
    let base = Math.log(size) / Math.log(1000)
    let suffixes = Object.values(this.t.Units)
    return parseFloat(Math.pow(1000, base - Math.floor(base)).toFixed(precision)) + ' ' + suffixes[Math.floor(base)]
  }

  htmlspecialchars (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  htmlspecialcharsDecode (str) {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#0*39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
  }

  getJti (token) {
    if (token === undefined || token === null || token === '') return false
    token = token.split('.')
    if (token.length !== 3) return false
    let payload = null
    let decoded = true
    try {
      payload = JSON.parse(base64.decode(token[1]))
    } catch (e) {
      decoded = false
    }
    if (!decoded || typeof payload.jti === 'undefined') return false
    return payload.jti
  }
}

export default new Utils()
