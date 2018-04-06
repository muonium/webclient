var store = {
  folder: {
    folder_id: 0,
    trash: false,
    transfers: false,
    display: 'mosaic',
    stored: 0,
    quota: 0
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
