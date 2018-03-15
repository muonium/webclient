<template>
  <div id="messageBoxContainer">
    <div class="MessageBox" :style="getStyle(index)" v-for="(box, index) in this.boxes" :key="'box-' + index" :data-index="index">
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
// import bus from '../bus'

export default {
  name: 'messageBox',
  data () {
    return {
      boxes: []
    }
  },
  methods: {
    add (data) {
      data.style = {
        top: 150,
        left: 350,
        width: 400,
        height: 180
      }
      this.boxes.push(data)
    },
    close (index) {
      this.$delete(this.boxes, index)
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
    getStyle (index) {
      let style = {}
      for (const s of Object.keys(this.boxes[index].style)) {
        style[s] = this.boxes[index].style[s] + 'px'
      }
      return style
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
<style src="../assets/css/Interface/MessageBox.css"></style>
