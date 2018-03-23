import store from './store'
import bus from './bus'
import sjcl from 'sjcl'

let vue = {}
let chunkSize = 512 * 1024 // Size of one chunk in B
let debug = true

let yesReplaceAll = false
let yesCompleteAll = false
let noAll = false

class Encryption {
  constructor (file, destFolder, id) {
    this.cek = sessionStorage.getItem('cek')
    this.est = 1.335 // Estimation of the difference between the file and encrypted file
    this.halt = false

    if (this.cek === null) return false

    this.salt = sjcl.random.randomWords(4) // crypto parameter: salt - 128 bits long
    this.key = sjcl.misc.pbkdf2(this.cek, this.salt, 7000, 256) // key derivation
    this.enc = new sjcl.cipher.aes(this.key) // eslint-disable-line new-cap

    this.file = file
    this.dest_filename = file.name.replace(/<\/?[^>]+(>|$)/g, '')
    this.dest_folder = destFolder
    this.id = id
    this.est_size = Math.round(file.size * this.est) // Estimation of encrypted file size

    this.start = 0 // Start to write at chunk x
    this.read = 0 // Number of chunks read
    this.written = 0 // Number of chunks written
    this.writtenB = 0 // Number of B written

    store.transfers.upload[id] = {
      name: this.dest_filename,
      pct: 0,
      error: false,
      error_msg: null
    }

    this.checkStatus() // Once initialized, check status before uploading
  }

  read (start = 0) {
    this.start = start
  }

/*
  Encryption.prototype.read = function(chkNb = 0) {
		if(debug) console.log("reading "+chkNb);
		this.m = chkNb;
		var me = this;

		this.parseFile(this.file, {
			binary: true,
			chunk_size: chunkSize,
			success: function(i) {
				if(me.halt) return false;
				// Waiting end of the uploading process
				var timer = setInterval(function() {
					if(debug) console.log("Waiting...");
					if(me.k >= me.j) {
						// Done, write "EOF" at the end of file
						clearInterval(timer);

						var xhr = new XMLHttpRequest();
						xhr.open("POST", target+'/writeChunk', true);
						xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

						xhr.onreadystatechange = function() {
							if(xhr.status == 200 && xhr.readyState == 4) {
								Transfers.number = Transfers.number <= 0 ? 0 : Transfers.number - 1;
								Transfers.numberUp = Transfers.numberUp <= 0 ? 0 : Transfers.numberUp - 1;
								$("#div_upload"+(me.i)).remove();
								if($('.transfers_upload > div').length === 0) {
									$('.transfers_upload').html(txt.User.nothing);
								}
								if(debug) {
									console.log("Split + encryption : "+time.elapsed()+" ms");
									console.log("Splitted in "+me.j+" chunks !");
								}
								if(typeof(me.callback) !== 'function') {
									Folders.open(me.folder_id);
								}
							}
						}
						xhr.send("filename="+me.file.name+"&data=EOF&folder_id="+me.folder_id);
					}
				}, 1000);
			},
			chunk_read_callback: function(chk) {
				// Reading a chunk
				if(me.halt) return false;
				me.j++;
				if(me.m < me.j) {
					chk = new Uint8Array(chk);
					chk = me.toBitArrayCodec(chk);
					var chk_length = me.encryptChk(chk, me.j);
					if(debug) console.log(me.file.name+' - Part '+me.j+' size : '+chk_length);
				}
				else {
					me.k++;
					me.l += Math.round(chunkSize*(1+est/100));
					var pct = me.l/me.est_size*100;
					if(pct > 100) pct = 100;

					$('#div_upload'+(me.i)).find('.pct').html(pct.toFixed(2)+'%');
					$('#div_upload'+(me.i)).find('.progress_bar > .used').css('width', pct.toFixed(2)+'%');

					console.log('Did not write part '+me.j);
				}
			},
			error_callback: errorHandler
		});
	};

	Encryption.prototype.parseFile = function(file, options) {
		var opts       = typeof options === 'undefined' ? {} : options;
		var fileSize   = file.size;
		var chunkSize  = typeof opts['chunk_size'] === 'undefined' ?  64 * 1024 : parseInt(opts['chunk_size']); // bytes
		var binary     = typeof opts['binary'] === 'undefined' ? false : opts['binary'] == true;
		var offset     = 0;
		var self       = this; // we need a reference to the current object
		var readBlock  = null;
		var chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function() {};
		var chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function() {};
		var success = typeof opts['success'] === 'function' ? opts['success'] : function() {};

		var onLoadHandler = function(evt) {
			var current_chk_length = evt.target.result.length;
			if(current_chk_length === undefined)
				current_chk_length = evt.loaded;

			if (evt.target.error == null && current_chk_length !== undefined) {
				offset += current_chk_length;
				chunkReadCallback(evt.target.result);
			} else {
				chunkErrorCallback(evt.target.error);
				return;
			}
			if (offset >= fileSize) {
				success(file);
				return;
			}

			readBlock(offset, chunkSize, file);
		}

		readBlock = function(_offset, length, _file) {
			var r = new FileReader();
			var blob = _file.slice(_offset, length + _offset);
			r.onload = onLoadHandler;
			if (binary) {
				r.readAsArrayBuffer(blob);
			} else {
				r.readAsText(blob);
			}
		}
		readBlock(offset, chunkSize, file);
	};
*/
  complete (line) {
    if (yesCompleteAll) {
      this.read(line)
    } else if (yesReplaceAll) {
      // TODO - rm + start reading at 0
    } else if (!noAll) {
      // TODO
    } else {
      this.abort()
    }
  }

  replace () {
    if (yesReplaceAll) {
      // TODO - rm + start reading at 0
    } else if (!noAll) {
      // TODO
    } else {
      this.abort()
    }
  }

  checkStatus () {
    vue.$http.post('files/status', {filename: this.dest_filename, folder_id: this.dest_folder, filesize: this.file.size}).then((res) => {
      if (typeof res.body.data.status !== 'undefined') {
        switch (res.body.data.status) {
          case 0: // Not exists
            this.read()
            break
          case 1: // Not completed
            this.complete(res.body.data.line)
            break
          case 2: // Completed
            this.replace()
            break
          default:
            this.error()
        }
      } else {
        this.error()
      }
    }, (res) => {
      this.halt = true
      if (res.body.message === 'quota') {
        this.error('User.quotaExceeded')
      } else {
        this.error()
      }
    })
  }

  toBitArrayCodec (bytes) {
    // Convert from an array of bytes to a bitArray
    let out = [], i, tmp = 0
		for (i = 0; i < bytes.length; i++) {
      tmp = tmp << 8 | bytes[i]
      if ((i&3) === 3) {
        out.push(tmp)
        tmp = 0
      }
		}
    if (i&3) {
      out.push(sjcl.bitArray.partial(8 * (i&3), tmp))
		}
		return out
	}

  error (msg) {
    console.log('Error', msg)
    bus.$emit('TransfersSetError', 'upload', this.id, msg)
  }

  abort () {
    // Abort encryption process
    this.halt = true
    console.log('abort ' + this.file.name)
  }
}

class Upload {
  constructor () {
    this.enc = []
  }

  checkAPI () {
    return (window.File && window.FileReader && window.FileList && window.Blob) ? true : false
	}

  upFiles (files, v) {
    vue = v
    if (!this.checkAPI()) {
      alert(vue.$t('User.fileAPI'))
      return false
    }
    store.folder.transfers = true
    bus.$emit('SidebarOpenTransfers')

    yesReplaceAll = false
    yesCompleteAll = false
    noAll = false

    for (let i = 0; i < files.length; i++) {
      this.enc.push(new Encryption(files[i], store.folder.folder_id, this.enc.length))
    }
  }

  abort (id) {
    this.enc[id].abort()
  }
}

export default new Upload()
