/**
 * @module nspclient
 * @fileoverview NSPClient for nodejs
 * @version v0.1
 * @author yafei.gg@gmail.com
 * @Copyright © 2009 - 2012 DBank网盘 All Rights Reserved
 */

/**
 * NSPClient Class
 * @param {Object} options,options为{
 *      host:'xxx', //optional
 *      port:xxx, //optional
 *      appid | sid:'xxx',
 *      appsecret | usersecret:'xxx',
 *      log: 'xxx' //optional
 *      }
 */
var NSPClient = function(options){
    var NSP = this;
    NSP.http = require('http');
    NSP.crypto = require('crypto');
    NSP.querystring = require('querystring');
    NSP.Host = options.host || 'api.dbank.com';
    NSP.Port = options.port || 80;
    NSP.AppId = options.appid;
    NSP.AppSecret = options.appsecret;
    NSP.Sid = options.sid;
    NSP.UserSecret = options.usersecret;
    //开启log
    if(options.log){
        var Logger = require('bunyan');
        NSP.log = new Logger({
            name:'nspclient',
            streams: [
                {
                     level: "info",
                     path: options.log
                 }
             ]
         });
    }

    /**
     * 生成查询字符串
     * @param {Object} obj 查询字符串对像
     *        {String} secret 用来生成nsp_key的密钥
     * @return {String} 查询字符串
     */
    NSPClient.prototype.genQueryString = function(obj,secret){
      var keys = Object.keys(obj).sort();
      var str = ''
      for(var i=0;i<keys.length;i++){
        str += keys[i] + obj[keys[i]];
      }
      var md5 = NSP.crypto.createHash('md5');
      md5.update(secret + str,'utf8');
      var nsp_key = md5.digest('hex').toUpperCase();
      obj.nsp_key = nsp_key;
      return NSP.querystring.stringify(obj);
    }

    /**
     * NSP服务调用接口
     * @param {String} order 命令字 eg. 'nsp.user.getInfo'
     *        {Object} params 参数对像 eg. {attrs:['user.uid','user.username']}
     *        {Function(data)} success 成功回调函数,data为接口返回内容
     * @return undefined
     */
    NSP.service = function(order,params,success){
        if(arguments.length === 2){
            success = arguments[1];
            var params = {};
        }
        for(var i in params){
            if(params.hasOwnProperty(i)){
                if(typeof params[i] === 'object'){
                    params[i] = JSON.stringify(params[i]);
                }
            }
        }
        params.nsp_svc = order;
        params.nsp_ts = new Date().getTime();
        //区分接口调用级别
        if(NSP.AppId){
            params.nsp_app = NSP.AppId;
            secret = NSP.AppSecret;
        }else{
            params.nsp_sid = NSP.Sid;
            secret = NSP.UserSecret;
        }
        var options = {
            host: NSP.Host,
            port: NSP.Port,
            path: '/rest.php'
        };
        options.path += '?' + NSP.genQueryString(params,secret);
        //NSP.log && NSP.log.info({"options": options,"params": params},order);
        NSP.http.get(options,function(res){
            var data =''
            res.on('data',function(chunk){
                data += chunk;
            });
            res.on('end',function(){
                var jsondata = JSON.parse(data);
                success(jsondata);
                NSP.log && NSP.log.info({
                    "request": {
                        "host": options.host,
                        "port": options.port,
                        "url":  options.path,
                        "params": params
                    },
                    "response": jsondata
                },order);
            });
        }).on('error',function(e){
            NSP.log && NSP.log.error('problem with request:' + e.message);
        });
    };
};

//导出公用接口
exports.NSPClient = NSPClient;
