const express = require('express');
const cache = require('memory-cache');
const createHash = require('create-hash');

const config = require('./config');
const util = require('../../util/util');
const common = require('../common/index');

const router = express.Router();

router.get('/test', function(req, res) {
  res.json({
    code: 0,
    data: 'test',
    message: ''
  })
})

// 用户授权重定向
router.get('/redirect', function(req, res) {
  const redirectUrl = req.query.url;
  const scope = req.query.scope;
  const callback = 'http://i.tangdong.com/api/wx/getOpenId';
  cache.put('redirectUrl', redirectUrl);
  const authorUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appId}&redirect_uri=${callback}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`
  res.redirect(authorUrl);
})
// 根据code获取用户的OpenId
router.get('/getOpenId', async function(req, res){
  const code = req.query.code;
  if(!code){
    res.json(util.handleFail('当前未获取到授权code码'));
  } else {
    const result = await common.getAccessToken(code);
    if (result.code === 0) {
      const data = result.data;
      const expire_time = 1000 * 60 * 60 * 2;
      cache.put('access_token', data.access_token, expire_time);
      cache.put('openId', data.openid, expire_time);
      res.cookie('openId', data.openid, { maxAge: expire_time});
      const redirectUrl = cache.get('redirectUrl');
      res.redirect(redirectUrl);
    } else {
      res.json(result);
    }
  }
})
// 获取用户信息
router.get('/getUserInfo',async function(req,res){
  let access_token = cache.get('access_token'), openId = cache.get('openId');
  let result = await common.getUserInfo(access_token, openId);
  res.json(result);
})

// 生成js-sdk配置
router.get('/jssdk',async function(req,res){
  let url = req.query.url;
  let result = await common.getToken();
  if (result.code == 0){
    let token = result.data.access_token;
    cache.put('token', token);
    let result2 = await common.getTicket(token);
    if (result2.code == 0){
      let data = result2.data;
      let params = {
        noncestr:util.createNonceStr(),
        jsapi_ticket: data.ticket,
        timestamp:util.createTimeStamp(),
        url
      }
      let str = util.raw(params);
      let sign = createHash('sha1').update(str).digest('hex');
      res.json(util.handleSuc({
        appId: config.appId, // 必填，公众号的唯一标识
        timestamp: params.timestamp, // 必填，生成签名的时间戳
        nonceStr: params.noncestr, // 必填，生成签名的随机串
        signature: sign,// 必填，签名
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareQZone',
          'chooseWXPay',
          'chooseImage',
        ] // 必填，需要使用的JS接口列表
      }))
    }
  }
})


module.exports = router;