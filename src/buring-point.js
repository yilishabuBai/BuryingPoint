/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-07-11 13:47:41 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-15 17:02:38
 */
(function (win, doc) {
    var UUID = require('uuid-js');
    // 使用ua-device库，build后体积增加近150KB
    var UA = require('ua-device');
    // 一天的毫秒数
    var DAY = 86400000;

    var scr = win.screen,
        nav = navigator,
        ua = nav.userAgent,
        protocol = 'https:' === win.location.protocol ? 'https://' : 'http://',
        // 上报地址，根据项目情况配置
        host = '127.0.0.1',
        page = '',
        baseUrl = protocol + host,
        // cookie名称，前后端需要协商定义
        cookieName = 'bp_did',
        year = 365,
        whiteList = [];

    var uaOutput = new UA(ua),
        totalTime = 0,
        stayTime = 10000;   // 触发间隔30秒
    
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
        /**
         * 获取该页面对应上报数据接口的路径
         */
        getPath: function () {
            return '/' + page + '/bp';
        },
        // 
        /**
         * 将json结构转为字符串
         * @param json 数据对象
         */
        json2Query: function (json) {
            var query = '';
            for (var i in json) {
                if (json.hasOwnProperty(i)) {
                    query += i + '=' + json[i] + '&';
                }
            }
            return query.substr(0, query.length - 1);
        },
        /**
         * 截取字符串
         * @param str 目标字符串
         * @param start 起始字符串
         * @param end 截取到的字符
         */
        stringSplice: function (str, start, end, pass) {
            if (str === '') {
                return '';
            }
            pass = pass === '' ? '=' : pass;
            start += pass;
            var ps = str.indexOf(start);
            ps = ps > 0 ? ps + start.length : 0;
            var pe = str.indexOf(end, ps);
            pe = pe > 0 ? pe : str.length;
            return str.substring(ps, pe);
        },
        /**
         * 白名单校验
         */
        checkWhiteList: function () {
            if (whiteList.length === 0) {
                return true;
            }
            var href = win.location.href;
            var flag = false;
            for (var i = 0; i < whiteList.length; i++) {
                if (href.indexOf(whiteList[i]) > -1) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },
        /**
         * 发送请求，使用image标签跨域
         * @param url 接口地址
         */
        sendRequest: function (url) {
            if (!utils.checkWhiteList()) {
                console.error('域名不在白名单内', '@burying-point');
                return;
            }
            if (page.length === 0) {
                console.error('请配置有效的page参数', '@burying-point');
                return;
            }
            var img = new Image();
            img.src = url;
        },
        /**
         * 设置cookie
         * @param name 名称
         * @param value 值
         * @param days 保存时间
         * @param domain 域
         */
        setCookie: function (name, value, days, domain) {
            if (value === null) {
                return;
            }
            if (domain === undefined || domain === null) {
                // 去除host中的端口部分
                domain = utils.stringSplice(win.location.host, 'host', ':', '');
            }
            if (days === undefined || days === null || days === '') {
                doc.cookie = name + '=' + value + ';domain=' + domain + ';path=/';
            } else {
                var now = new Date();
                var time = now.getTime() + DAY * days;
                now.setTime(time);
                doc.cookie = name + '=' + value + ';domain=' + domain + ';expires=' + now.toUTCString() + ';path/';
            }
        },
        /**
         * 读取cookie
         * @param name 名称
         */
        getCookie: function (name) {
            if (name === undefined || name === null) {
                return;
            }
            var reg = RegExp(name);
            if (reg.test(doc.cookie)) {
                return utils.stringSplice(doc.cookie, name, ';', '');
            }
        },
        /**
         * 解析bp-data中的数据
         * @param datastr 
         */
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
        },
        /**
         * 跨浏览器事件侦听
         */
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
        mobile: function () {
            try {
                doc.createEvent('TouchEvent');
                return true;
            } catch (e) {
                return false;
            }
        }()
    };

    // 简易版Ticker
    var ticker = {
        tid: 0,
        lastTime: 0,
        funcs: [],
        /**
         * 启动
         */
        start: function () {
            if(ticker.tid > 0) {
                return;
            }
            ticker.lastTime = 0;
            ticker.tid = setInterval(function () {
                var time = new Date().getTime();
                if(ticker.lastTime > 0) {
                    var delay = time - ticker.lastTime;
                    for (var i = 0; i < ticker.funcs.length; i++) {
                        ticker.funcs[i].func(delay);
                    }
                }
                ticker.lastTime = time;
            }, 33);
        },
        /**
         * 停止
         */
        stop: function () {
            clearInterval(ticker.tid);
            ticker.tid = 0;
        },
        /**
         * 注册钩子函数
         * @param func 方法
         */
        register: function (func) {
            ticker.funcs.push({ 'func': func });
        },
        /**
         * 删除钩子函数
         * @param func 方法
         */
        unregister: function (func) {
            for (var i = 0; i < ticker.funcs.length; i++) {
                if(func === ticker.funcs[i].func) {
                    ticker.funcs.splice(i, 1);
                }
            }
        }
    };

    var BP = {
        /**
         * 会话id，刷新页面会更新
         */
        sessionId: function () {
            return UUID.create();
        }(),
        /**
         * 设备id，读取cookie，不存在则种入cookie
         */
        deviceId: function () {
            var did = utils.getCookie(cookieName);
            if (!did) {
                did = UUID.create();
                utils.setCookie(cookieName, did, year);
            }
            return did;
        }(),
        /**
         * 获取基础数据，包括浏览器数据，时间戳
         */
        getData () {
            var ci = utils.json2Query(CI);
            var t = 't=' + new Date().getTime();
            var arr = win.location.href.split('//');
            var source = arr.length > 1 ? arr[1] : arr[0];
            // 去除参数
            var href = 'href=' + encodeURIComponent(utils.stringSplice(source, 'href', '?', ''));
            var ref = 'ref=' + encodeURIComponent(utils.stringSplice(doc.referrer, 'ref', '?', ''));
            var sid = 'sessionId=' + BP.sessionId;
            var did = 'deviceId=' + BP.deviceId;
            return ci + '&' + t + '&' + href + '&' + ref + '&' + sid + '&' + did;
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
                    extstr = 'ext={' + extstr.substr(0, extstr.length - 1) + '}';
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
        },
        set whiteList (value) {
            whiteList = value;
        },
        get whiteList () {
            return whiteList;
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
     * Ticker钩子函数，用于上报页面停留时长
     * @param dt 间隔时间
     */
    var calStayTime = function (dt) {
        totalTime += dt;
        if(totalTime >= stayTime) {
            BP.send('stay', { time: stayTime });
            totalTime -= stayTime;
        }
    };

    /**
     * 启动埋点
     */
    var start = function () {
        buryingPoint();
        
        BP.sendPV();

        // 启动ticker
        ticker.start();
        ticker.register(calStayTime);

        // 页面离开时不再计时
        utils.addEvent(doc, 'visibilitychange', function () {
            if (doc.visibilityState === 'hidden') {
                ticker.stop();
            } else {
                ticker.start();
            }
        });
    };

    // 侦听load事件，准备启动数据上报
    utils.addEvent(win, 'load', function () {
        if (!utils.checkWhiteList()) {
            console.error('域名不在白名单内', '@burying-point');
            return;
        }

        console.log('即将开始上报数据');
        start();
    });

    win.BP = BP;

})(window, document);