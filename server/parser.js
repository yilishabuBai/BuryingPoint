const querystring = require('querystring');

var Parser = function () {
    this.status = 500;
};

Parser.prototype.parse = function (url) {
    let [path, attr] = url.split('?');
    let [, page, bp] = path.split('/');

    if (bp !== 'bp' || !page) {
        return;
    }

    let data = [];
    data.push(page);
    let d = querystring.parse(attr);
    data.push(d.evt);
    let [width, height] = d.size.split('x');
    data.push(parseInt(width));   // size
    data.push(parseInt(height));  // size
    data.push(d.network);
    data.push(d.language);
    data.push(parseInt(d.timezone));
    data.push(d.ua);
    data.push(d.os);
    data.push(d.browser);
    data.push(d.engine);
    data.push(parseInt(d.t));
    data.push(d.href);
    data.push(d.ref);
    data.push(d.sessionId);
    data.push(d.deviceId);
    return data;
};

module.exports = Parser;