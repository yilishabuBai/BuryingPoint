/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-07-11 13:47:41 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-11 16:38:48
 */
(function (win, doc) {
    var UUID = require('uuid-js');
    // 使用ua-device库，build后体积增加近150KB
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
        }(),
        parse: function (datastr) {
            var data = {};
            // 消除空格
            datastr = datastr.replace(/\s/g, '');
            datastr = datastr.substr(1, datastr.length - 2);
            var objarr = datastr.split(',');
            for (var i = 0; i < objarr.length; i++) {
                var arr = objarr[i].split(':');
                data[arr[0]] = arr[1];
            }
            return data;
        }
    };

    var BP = {
        /**
         * 获取基础数据
         */
        getData () {
            var ci = utils.json2Query(CI);
            return ci;
        },
        /**
         * 上报pv
         */
        sendPV () {
            BP.send('visit');
        },
        /**
         * 上报数据
         * @param evt 事件
         * @param ext 扩展数据
         */
        send (evt, ext) {
            if (evt === '') {
                return;
            }
            var extstr = '';
            if (ext) {
                for (var i in ext) {
                    if (ext.hasOwnProperty(i)) {
                        extstr += '"' + i + '":"' + ext[i] + '",';
                    }
                }
                if (extstr.length > 0) {
                    extstr += 'ext={' + extstr.substr(0, extstr.length - 1) + '}';
                }
            }
            var url = baseUrl +
                utils.getPath() +
                '?evt=' + evt +
                '&' + BP.getData() +
                (extstr.length > 0 ? '&' + extstr : '');
            utils.sendRequest(url);
        },
        set page (value) {
            page = value;
        },
        get page () {
            return page;
        }
    };

    /**
     * 埋点，捕获带有bp-data属性的节点点击事件
     */
    var buryingPoint = function () {
        var attr = 'bp-data';
        var evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(doc, evtType, function (evt) {
            var target = evt.srcElement || evt.target;
            while (target && target.parentNode) {
                if (target.hasAttribute(attr)) {
                    var metadata = target.getAttribute(attr);
                    var data = utils.parse(metadata);
                    if (target.nodeName.toLowerCase() === 'a') {
                        data.href = encodeURIComponent(target.href);
                    }
                    if (data.evt) {
                        var event = data.evt;
                        delete data.evt;
                        BP.send(event, data);
                    }
                    break;
                }
                target = target.parentNode;
            }
        });
    };

    /**
     * 启动埋点
     */
    var start = function () {
        buryingPoint();
        
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