import moment from 'moment'

class Utils {
  constructor () {
    this.t = null // Language JSON set in App.vue
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
}

export default new Utils()
