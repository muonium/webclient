<template>
  <div id="messageBoxContainer">
    <transition-group tag="div" name="fade">
      <div
        class="MessageBox"
        v-for="(box, index) in this.boxes"
        :key="'box-' + index"
        :data-index="index"
        v-on:mousedown="dragStart(index, $event)"
      >
        <div class="MessageBoxClose" @click="close(index)">x</div>
        <div class="MessageBoxTitle" v-if="box.title">{{ box.title }}</div>
        <div class="MessageBoxTxt" v-if="box.txt" v-html="box.txt"></div>
        <div class="MessageBoxToggle" v-if="box.toggles">
          <div v-for="(toggle, index) in box.toggles" :key="'toggle-' + index">
            <span>{{ toggle.leftTxt }}</span>
            <label class="switch">
              <input type="checkbox" v-on:click.stop="typeof toggle.clickEvent !== 'undefined' ? toggle.clickEvent($event) : null">
              <div class="slider"></div>
            </label>
            <span>{{ toggle.rightTxt }}</span>
          </div>
        </div>
        <div class="MessageBoxInput" v-if="box.inputs">
          <p class="input-large" v-for="(input, index) in box.inputs" :key="'input-' + index">
            <input
              v-bind="attributes(input)"
              v-on:click="typeof input.clickEvent !== 'undefined' ? input.clickEvent($event) : null"
              v-on:keyup="typeof input.keyUpEvent !== 'undefined' ? input.keyUpEvent($event) : null"
              v-on:keydown="typeof input.keyDownEvent !== 'undefined' ? input.keyDownEvent($event) : null"
            >
            <label :class="input.icon" :for="typeof input.id !== 'undefined' ? input.id : ''" v-if="input.icon"></label>
          </p>
        </div>
        <div class="MessageBoxBtns" v-if="box.btns">
          <input
            v-bind="attributes(btn)"
            @click="typeof btn.clickEvent !== 'undefined' ? btn.clickEvent($event) : null"
            v-for="(btn, index) in box.btns"
            :key="'btn-' + index"
          >
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'messageBox',
  data () {
    return {
      boxes: [],
      drag: null,
      headerHeight: 0,
      diffLeft: 0,
      diffTop: 0
    }
  },
  methods: {
    add (data) {
      let autofocus = false
      // Check input icon and autofocus before adding messageBox
      if (typeof data.inputs !== 'undefined') {
        data.inputs.forEach((input, index) => {
          if (typeof input.icon === 'undefined') {
            if (typeof input.class === 'undefined') {
              input.class = 'noicon'
            } else {
              input.class += ' noicon'
            }
          }
          if (typeof input.autofocus !== 'undefined' && (input.autofocus === true || input.autofocus === 'autofocus')) {
            autofocus = index + 1
          }
        })
      }
      this.boxes.push(data)
      this.$nextTick(() => {
        // Once DOM has been refreshed, place cursor at the end of value if autofocus
        if (autofocus !== false) {
          let el = document.querySelector('#messageBoxContainer .MessageBox:last-child > .MessageBoxInput input:nth-child(' + autofocus + ')')
          if (el !== null) {
            el.focus()
          }
        }
      })
    },
    close (index) {
      this.$delete(this.boxes, index)
    },
    closeAll () {
      this.boxes = []
    },
    dragStart (index, e) {
      if (['input', 'button', 'textarea', 'a'].indexOf(e.target.tagName.toLowerCase()) === -1) {
        let el = document.querySelector('.MessageBox[data-index="' + index + '"]')
        if (el) {
          this.headerHeight = document.querySelector('header').offsetHeight
          let rect = el.getBoundingClientRect()
          this.drag = parseInt(index)
          this.diffLeft = e.pageX - Math.round(rect.left)
          this.diffTop = e.pageY - Math.round(rect.top)
        }
      }
    },
    dragMove (e) {
      if (this.drag !== null) {
        if (e.which === 1) {
          let el = document.querySelector('.MessageBox[data-index="' + this.drag + '"]')
          if (el) {
            let left = e.pageX - this.diffLeft
            let top = e.pageY - this.diffTop

            if (left < 5) left = 5
            if (left + el.clientWidth > document.body.clientWidth - 5) left = document.body.clientWidth - el.clientWidth - 5
            if (top < this.headerHeight + 5) top = this.headerHeight + 5
            if (top + el.clientHeight > document.body.clientHeight - 5) top = document.body.clientHeight - el.clientHeight - 5

            el.style.transform = 'none'
            el.style.left = left + 'px'
            el.style.top = top + 'px'
          }
        } else {
          this.dragStop()
        }
      }
    },
    dragStop () {
      this.drag = null
    },
    getIndexFromEvent (e) {
      if (typeof e.target !== 'undefined' && typeof e.target.parentElement !== 'undefined') {
        let el = e.target
        while (el) {
          if (typeof el.classList !== 'undefined' && el.classList.contains('MessageBox')) {
            let index = el.getAttribute('data-index')
            if (index !== null && index !== '' && !isNaN(parseInt(index))) {
              return parseInt(index)
            }
          }
          el = el.parentElement
        }
      }
      return false
    },
    attributes (input) {
      // Keep only HTML attributes to set in input
      let exclude = ['keydownevent', 'keyupevent', 'clickevent', 'icon']
      return Object.keys(input).filter((key) => {
        return exclude.indexOf(key.toLowerCase()) === -1
      }).reduce((res, key) => {
        res[key] = input[key]
        return res
      }, {})
    }
  },
  created () {
    window.addEventListener('mouseup', this.dragStop)
    window.addEventListener('mousemove', this.dragMove)
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.dragStop)
    window.removeEventListener('mousemove', this.dragMove)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .4s;
}
.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}
</style>
<style src="../assets/css/Interface/MessageBox.css"></style>
