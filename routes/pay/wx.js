const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('./config')
const cache = require('memory-cache')
const {sha1} = require('../../utils/crypto')
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
        const expire_time = 1000 * 10
        cache.put('access_token', data.access_token, expire_time )
        cache.put('openid', data.openid, expire_time)
        // console.log(data,'body')
        res.cookie('openId', data.openid, {
          maxAge: expire_time,
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

router.get('/getConfig', function (req,res) {
  let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wx.appId}&secret=${config.wx.appSecret}`
  request.get(url, (err, response, body) => {
    const data = JSON.parse(body)
    cache.put('sdk_access_token',data.access_token)
    getTicket(res, req.query.url)
  })
})
const getTicket = async (res, sdkUrl) => {
  const access_token = cache.get('sdk_access_token')
  let url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
  request.get(url, (err, response, body) => {
    const data = JSON.parse(body)
    const nonceStr = 'Wm3WZYTPz0wzccnW'
    const timestamp = Date.now()
    let raw = `jsapi_ticket=${data.ticket}&noncestr=&timestamp=${timestamp}&url=${sdkUrl}`
    res.json({
      appId: config.wx.appId, // 必填，公众号的唯一标识
      timestamp, // 必填，生成签名的时间戳
      nonceStr: nonceStr, // 必填，生成签名的随机串
      signature: sha1(raw),// 必填，签名
      sdkUrl: sdkUrl
    })
  })
}
module.exports = router
