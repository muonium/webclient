let slide = {
  methods: {
    slide (el) {
      this.el = el
    },
    end () { // Animation finished
      this.el.style.height = null
      this.el.style.overflow = 'visible'
      this.el.removeEventListener('transitionend', this.end)
    }
  },
  created () {
    this.el = null
    this.before = null
    this.after = null
  },
  beforeUpdate () {
    if (this.el.style.height) { // When the previous animation is not finished
      this.el.style.overflow = 'hidden'
      this.el.style.height = null
    }
    this.before = window.getComputedStyle(this.el).height
  },
  updated () {
    if (window.innerWidth >= 800) {
      this.$nextTick(() => {
        this.after = window.getComputedStyle(this.el).height
        if (this.before === this.after) return

        this.el.style.overflow = 'hidden'
        this.el.style.transition = '1s'
        this.el.style.height = this.before
        this.before = this.el.offsetHeight

        this.el.style.height = this.after
        this.el.addEventListener('transitionend', this.end)
      })
    }
  }
}

export default slide
