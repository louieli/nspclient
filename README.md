nspclient
=========

华为网盘SDK,用于调用华为网盘开放平台服务

安装
=========

npm install nspclient

使用
=========

*0.登录*

>参见http://open.dbank.com/wiki/index.php?title=开放平台鉴权

>应用级接口不需要鉴权

*1.引入sdk*

    var nsp = require('nspclient');

*2.初始化*

    nspclient = new nsp.NSPClient(obj);
    obj中传入sid/usersecret(用户级调用)或appid/appsecret(应用级调用),log属性可选。

    nspclient = new nsp.NSPClient({
        sid: 'xxx',
        usersecret: 'xxx',
        log: 'log.txt'
    });

*3.调用服务*

>nspclient.service(order,params,callback)

>order  服务名称

>params 参数

>callback 回调

    var userInfo = ['user.uid', 'user.username', 'user.status','profile.productid'];
    nspclient.service('nsp.user.getInfo',{attrs:userInfo},function(data){
        console.log(data);
    });






