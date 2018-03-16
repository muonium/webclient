<template>
  <div id="messageBoxContainer">
    <div
      class="MessageBox"
      v-for="(box, index) in this.boxes"
      :key="'box-' + index"
      :data-index="index"
      v-on:mousedown="dragStart(index, $event)"
    >
      <div class="MessageBoxClose" @click="close(index)">x</div>
      <div class="MessageBoxTitle" v-if="box.title">{{ box.title }}</div>
      <div class="MessageBoxTxt" v-if="box.txt">{{ box.txt }}</div>
      <div class="MessageBoxToggle" v-if="box.toggle"></div>
      <div class="MessageBoxInput" v-if="box.inputs">
        <p class="input-large" v-for="(input, index) in box.inputs" :key="'input-' + index">
          <input
            v-bind="attributes(input)"
            v-on:click="typeof input.clickEvent !== 'undefined' ? input.clickEvent($event) : null"
            v-on:keyup="typeof input.keyUpEvent !== 'undefined' ? input.keyUpEvent($event) : null"
            v-on:keypress="typeof input.keyPressEvent !== 'undefined' ? input.keyPressEvent($event) : null"
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
      this.boxes.push(data)
    },
    close (index) {
      this.$delete(this.boxes, index)
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

            if (left < 0) left = 5
            if (left + el.clientWidth > document.body.clientWidth) left = document.body.clientWidth - el.clientWidth - 5
            if (top < this.headerHeight) top = this.headerHeight + 5
            if (top + el.clientHeight > document.body.clientHeight) top = document.body.clientHeight - el.clientHeight - 5

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
      if (e.path) {
        for (let i of e.path) {
          if (typeof i.classList !== 'undefined' && i.classList.contains('MessageBox')) {
            let index = i.getAttribute('data-index')
            if (index !== null && index !== '' && !isNaN(parseInt(index))) {
              return parseInt(index)
            }
          }
        }
      }
      return false
    },
    attributes (input) {
      // Keep only HTML attributes to set in input
      let exclude = ['keypressevent', 'keyupevent', 'clickevent', 'icon']
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
<style scoped></style>
<style src="../assets/css/Interface/MessageBox.css"></style>
