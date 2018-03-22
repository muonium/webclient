import store from './store'

class Download {
  abort (id) {
    console.log(store)
  }

  dl (id) {
    console.log(id)
  }
}

export default new Download()
