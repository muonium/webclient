import base64 from 'hi-base64'
import sha512 from 'js-sha512'

let hex2chars = function (input) {
  let output = ''
  input = input.replace(/^(0x)?/g, '').replace(/[^A-Fa-f0-9]/g, '').split('')
  for (let i = 0; i < input.length; i += 2) {
    output += String.fromCharCode(parseInt(input[i] + '' + input[i + 1], 16))
  }
  return output
}

export default function (input) {
  // Hash a string in sha384 thanks to sha512 package, convert it in base64 thanks to base64 package
  return base64.encode(hex2chars(sha512.sha384(input)), true)
}
