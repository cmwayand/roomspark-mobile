var QRCode = require('qrcode')

QRCode.toDataURL('https://roomspark.app', function (err, url) {
  console.log(url)
})