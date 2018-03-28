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
    upSelected: true,
    upload: [],
    download: []
  }
}

export default store
