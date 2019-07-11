/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-07-11 13:47:41 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-11 14:57:24
 */
(function (win, doc) {
    var UUID = require('uuid-js');
    var UA = require('ua-device');

    var scr = win.screen,
        nav = navigator,
        ua = nav.userAgent,
        uuid = '',
        protocol = 'https:' === win.location.protocol ? 'https://' : 'http://',
        host = '127.0.0.1',
        page = '',
        baseUrl = protocol + host,
        cookieName = '',
        whiteList = [];
    
    var uaOutput = new UA(ua);
    
    // 浏览器信息
    var CI = {
        size: function () {
            return scr.width + 'x' + scr.height;
        }(),
        // 网络类型
        network: function () {
            return (nav.connection && nav.connection.type) ? nav.connection.type : '-';
        }(),
        // 语言
        language: function () {
            return nav.language || '';
        }(),
        timezone: function () {
            return new Date().getTimezoneOffset() / 60 || '';
        }(),
        ua: function () {
            return encodeURIComponent(ua);
        }(),
        os: function () {
            var o = uaOutput.os;
            return encodeURIComponent(o.name + '_' + o.version.original);
        }(),
        browser: function () {
            var b = uaOutput.browser;
            return b.name + '_' + b.version.original;
        }(),
        engine: function () {
            var e = uaOutput.engine;
            return e.name + '_' + e.version.original;
        }()
    };

    var utils = {
        // 获取该页面对应上报数据接口的路径
        getPath: function () {
            return '/' + page + '/bp';
        },
        // 将json结构转为字符串
        json2Query: function (json) {
            var query = '';
            for (var i in json) {
                if (json.hasOwnProperty(i)) {
                    query += i + '=' + json[i] + '&';
                }
            }
            return query.substr(0, query.length - 1);
        },
        // 发送请求，使用image标签跨域
        sendRequest: function (url) {
            if (page.length === 0) {
                console.error('请配置有效的page参数', '@burying-point');
                return;
            }
            var img = new Image();
            img.src = url;
        },
        // 跨浏览器事件侦听
        addEvent: function () {
            if (doc.attachEvent) {
                return function (ele, type, func) {
                    ele.attachEvent('on' + type, func);
                };
            } else if (doc.addEventListener) {
                return function (ele, type, func) {
                    ele.addEventListener(type, func, false);
                };
            }
        }()
    };

    var BP = {
        getData () {
            var ci = utils.json2Query(CI);
            return ci;
        },
        // 上报pv
        sendPV () {
            var url = baseUrl + utils.getPath() + '?evt=visit&' + BP.getData();
            utils.sendRequest(url);
        },
        set page (value) {
            page = value;
        },
        get page () {
            return page;
        }
    };

    // 启动埋点
    var start = function () {
        BP.sendPV();
    };

    console.log(CI, 'href: ' + win.location.href, 'referrer: ' + doc.referrer);

    // 侦听load事件，准备启动数据上报
    utils.addEvent(win, 'load', function () {
        console.log('埋点脚本要开始运行了');
        start();
    });

    win.BP = BP;

})(window, document);