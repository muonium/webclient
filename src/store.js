var store = {
  folder: {
    folder_id: 0,
    trash: false,
    transfers: false
  },
  selection: {
    files: [],
    folders: []
  },
  move: {
    files: [],
    folders: []
  },
  transfers: {
    upload: [
      {id: 1, name: 'test.txt', pct: 50}
    ],
    download: []
  }
}

export default store
