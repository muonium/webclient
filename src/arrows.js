import bus from './bus'

class Arrows {
  constructor () {
    this.selected = null
    this.loaded = false
    this.rows = []
  }

  reset () {
    this.selected = null
    this.rows = []
    this.loaded = false
  }

  load () {
    let tree = document.querySelector('#tree')
    if (tree) {
      this.rows = tree.querySelectorAll('tr:not(#tree_head):not(.break)')
      this.loaded = true
    }
  }

  add (multiple = false) {
    if (this.selected !== null && typeof this.rows[this.selected] !== 'undefined' && typeof this.rows[this.selected].id !== 'undefined') {
      let type = this.rows[this.selected].id.substr(0, 1)
      if (type === 'f') {
        bus.$emit('SelectionAddFile', this.rows[this.selected].id.substr(1), (multiple ? 'ctrl' : null))
      } else if (type === 'd') {
        bus.$emit('SelectionAddFolder', this.rows[this.selected].id.substr(1), (multiple ? 'ctrl' : null))
      }
      this.scroll()
    }
  }

  up (multiple = false) {
    if (!this.loaded) this.load()
    if (this.loaded) {
      if (this.selected !== null && this.selected > 0) {
        this.selected--
      } else {
        this.selected = this.rows.length - 1
      }
      this.add(multiple)
    }
  }

  down (multiple = false) {
    if (!this.loaded) this.load()
    if (this.loaded) {
      if (this.selected !== null && this.selected < this.rows.length - 1) {
        this.selected++
      } else {
        this.selected = 0
      }
      this.add(multiple)
    }
  }

  scroll () {
    // Autoscroll
    if (this.selected !== null && typeof this.rows[this.selected] !== 'undefined') {
      let sy = this.rows[this.selected].offsetTop - document.querySelector('#tree_head').offsetTop - 130 // Diff with tree head because FF doesn't use relative offset
      let syMax = document.body.scrollHeight - document.body.clientHeight
      sy = sy > syMax ? syMax : sy
      document.documentElement.scrollTop = sy
      document.body.scrollTop = sy
    }
  }
}

export default new Arrows()
