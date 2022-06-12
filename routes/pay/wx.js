const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('./config')
const cache = require('memory-cache')
router.get('/test', function (req, res) {
  res.json({
    code: 0,

  })
})
router.get('/redirectUrl', function (req, res) {
  cache.put('redirectUrl', '1234')
  let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wx.appId}&redirect_uri=http%3A%2F%2F192.168.31.222%3A8080%2F&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  res.redirect(url)
})
router.get('/getOpenId', function (req, res) {
  const code = req.query.code
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wx.appId}&secret=${config.wx.appSecret}&code=${code}&grant_type=authorization_code`
  if (!code) {
    res.json({
      message: '没code'
    })
  } else {
    request.get(url, (err, response, body) => {
      if(!err) {
        const data = JSON.parse(body)
        console.log(data,'body')
        res.cookie('openId', data.openid, {
          maxAge: 1000 * 60
        })
        res.json(data)
      }
    })
  }
})
module.exports = router
