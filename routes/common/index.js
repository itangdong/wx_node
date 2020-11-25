const request = require('request');
const config = require('../wx/config');
const util = require('./../../util/util')
exports.getAccessToken = function(code){
  let token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.appId}&secret=${config.appSecret}&code=${code}&grant_type=authorization_code`;
  return new Promise((resolve, reject) => {
    request.get(token_url, function (err, response, body) {
      const result = util.handleResponse(err, response, body);
      resolve(result);
    })
  });
}
exports.getUserInfo = function (access_token,openId){
  const userInfo = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openId}&lang=zh_CN`;
  return new Promise((resolve,reject)=>{
    request.get(userInfo, function (err, response, body) {
      const result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}
// 获取基础接口的Token
exports.getToken = function (){
  const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
  return new Promise((resolve,reject)=>{
    request.get(tokenUrl, function (err, response, body) {
      const result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}

// 根据Token获取Ticket
exports.getTicket = function (token){
  const tokenUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  return new Promise((resolve,reject)=>{
    request.get(tokenUrl, function (err, response, body) {
      const result = util.handleResponse(err, response, body);
      resolve(result);
    })
  })
}