class ExtIcons {
  constructor () {
    this.types = {
      archive: ['zip', 'tar', 'gz', 'bz', 'bz2', 'xz', 'rar', 'jar', '7z', 'lzma'],
      code: [
        'php', 'html', 'htm', 'php3', 'php4', 'php5', 'java', 'css', 'scss', 'xml', 'svg', 'sql', 'c', 'cpp', 'cs', 'js', 'au3', 'asm', 'h',
        'ini', 'jav', 'p', 'pl', 'rb', 'sh', 'bat', 'py'
      ],
      image: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tif', 'tiff', 'jls', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm', 'mj2'],
      doc: ['docx', 'odt', 'doc', 'odp'],
      pdf: ['pdf'],
      sound: ['mp3', 'ogg', 'flac', 'wav', 'aac', 'm4a'],
      video: ['mp4', 'avi', 'wmv', 'mpeg', 'mov', 'mkv', 'mka', 'mks', 'flv']
    }
  }

  get (filename) {
    let icon = 'text'
    let pos = filename.lastIndexOf('.')
    if (pos !== -1) {
      let ext = filename.substr(pos + 1).toLowerCase()
      for (let key of Object.keys(this.types)) {
        if (this.types[key].indexOf(ext) !== -1) {
          icon = key
          break
        }
      }
    }
    return icon
  }
}

export default new ExtIcons()
