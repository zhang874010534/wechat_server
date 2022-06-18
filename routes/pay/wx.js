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
        cache.put('access_token', data.access_token, 1000 * 60)
        cache.put('openid', data.openid, 1000 * 60)
        console.log(data,'body')
        res.cookie('openId', data.openid, {
          maxAge: 1000 * 60,
          samesite: 'none'
        })
        res.json(data)
      }
    })
  }
})
router.get('/getUserInfo', function (req, res) {
  const access_token = cache.get('access_token')
  const openid = cache.get('openid')
  let url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
  request.get(url, (err, response, body) => {
    res.json(JSON.parse(body))
  })
})
module.exports = router
