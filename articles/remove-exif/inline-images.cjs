const fs = require('fs')

const u = {
  'cover.jpg':
    'https://mmbiz.qlogo.cn/sz_mmbiz_jpg/fOE5CWxaEFeAbEScYQX5nhAeiaWiadiazp4pChQvibt9NfUZvGibxibXTO5utFCggqoMypYszs4DPyg6lTJXpqlMWyhECV9guuQRhpCXFQNzWbVKM/0?wx_fmt=jpeg&from=appmsg',
  'wx-01-detect.png':
    'https://mmbiz.qlogo.cn/mmbiz_png/fOE5CWxaEFeMfqkltT4ER9r4fo1tuI4CLUnPLlqCbwRgQ2mKLCrFNO0w90F7zTXWVkgavrYX0Hdsgp6HPEc4cMhplvsqgDlVL0z1zC3mHWQ/0?wx_fmt=png&from=appmsg',
  'wx-02-done.png':
    'https://mmbiz.qlogo.cn/mmbiz_png/fOE5CWxaEFdiafkhpDnnU4OpsGLx7OL4rVSxKTt07T5lNA8I4WkMQJ78FRQbGewTc31MalKzI3PbHrMvArHlHDiaq9xxjpjRdYlE9s9d3NxGc/0?wx_fmt=png&from=appmsg',
  'wx-03-editor.png':
    'https://mmbiz.qlogo.cn/mmbiz_png/fOE5CWxaEFefUu3qnL9evtNxgPPu2cWguMYM3vdzv8Q81gtcic6AsSKWK4B7kJBN7oL6CVNYcFNHRicj093BX3MjZib8pmfYJlCkR2ZgAzDjSA/0?wx_fmt=png&from=appmsg',
  'wx-04-info.png':
    'https://mmbiz.qlogo.cn/sz_mmbiz_png/fOE5CWxaEFfyRSGnJ1NBG2OAgrKjHs9bAia26Pj4n2Cay3947wX7RStfqVZaQhTrNCXlcnfea2purR4mNNfG3spGQZNQQMQTUTeNU68WCZds/0?wx_fmt=png&from=appmsg',
}

let s = fs.readFileSync(process.argv[2] || 'zh-body.html', 'utf8')
s = s.replace(/`([^`]+)`/g, '$1')
s = s.replace(/\{\{IMG:([^}]+)\}\}/g, (m, k) => u[k] || m)
fs.writeFileSync('zh-body-final.html', s)
console.log('bytes', s.length, 'left', (s.match(/\{\{IMG/g) || []).length)
