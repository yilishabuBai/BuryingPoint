/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-07-16 23:37:10 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-17 11:49:28
 */
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var SQLite = function () {
    
};

SQLite.prototype.onError = function (err) {
    console.log('Error Message:', err.message, 'Error Number:', err.no);
};

/**
 * 创建数据库，初始化表
 */
SQLite.prototype.create = function (database, tables) {
    this._db = new sqlite3.Database(database);
    if (!fs.existsSync(database)) {
        // 序列化执行sql语句
        this._db.serialize(() => {
            for (let i = 0; i < tables.length; i++) {
                this._db.run(tables[i], (err) => {
                    if (err) {
                        this.onError(err);
                    }
                });
            }
        });
    }
};

/**
 * 插入数据
 */
SQLite.prototype.insert = function (sql, values) {
    this._db.serialize(() => {
        let stmt = this._db.prepare(sql);
        for (let i = 0; i < values.length; i++) {
            stmt.run(values[i]);
        }
        stmt.finalize();
    });
};

/**
 * 查找数据
 */
SQLite.prototype.query = function (sql, callback) {
    let data = [];
    this._db.each(sql, (err, row) => {
        if (err) {
            this.onError(err);
        } else {
            data.push(row);
        }
    }, (err, count) => {
        if (err) {
            this.onError(err);
        } else {
            callback(data, count);
        }
    });
};

/**
 * 执行sql语句，用于update/delete等
 */
SQLite.prototype.execute = function (sql) {
    this._db.run(sql, (err) => {
        if (err) {
            this.onError(err);
        }
    });
};

module.exports = SQLite;

