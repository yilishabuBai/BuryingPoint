/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-07-17 16:07:32 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-17 16:57:28
 */
const HTTP = require('http');
const URL = require('url');
const QueryString = require('querystring');
const SQL = require('./database/sqlite');
const Parser = require('./parser');
const SQLData = require('./sql-data.json');

var sql = new SQL();
sql.create('./server/database/data.db', SQLData.tables);

var parser = new Parser();

// 异步处理两个SELECT语句
var currentCount = 0;
var resultCount = 2;
var content = '';
function result (res, key, value) {
    content += `"${key}":${value}`;
    currentCount++;
    if (currentCount === resultCount) {
        content += '}';
        // httpHeaders处理跨域
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
        res.write(content);
        res.end();
        return;
    }
    content += ',';
}

/**
 * 插入数据
 * @param req 
 * @param res 
 */
function buryingPoint (req, res) {
    let data = parser.parse(req.url);
    if (!data) {
        res.writeHead(404);
    } else {
        sql.insert(SQLData.insert, [data]);
        res.writeHead(200);
    }
    res.end();
}

/**
 * 统计数据
 * @param req 
 * @param res 
 */
function query (req, res) {
    content = '{';
    currentCount = 0;

    sql.query(SQLData.query.uv, (data, count) => {
        result(res, 'uv', count);
    });

    sql.query(SQLData.query.pv, (data, count) => {
        result(res, 'pv', count);
    });

    // sql.query(SQLData.query.stay, (data, count) => {
    //     result(res, 'stay', count * 10);
    // });
}

/**
 * 启动服务器
 */
HTTP.createServer((req, res) => {
    var urlInfo = URL.parse(req.url);
    switch (urlInfo.pathname) {
        case '/query':
            query(req, res);
            break;
        default:
            buryingPoint(req, res);
            break;
    }
}).listen('6869');