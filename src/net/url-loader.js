/*
 * @Author: 伊丽莎不白 
 * @Date: 2019-05-30 14:06:46 
 * @Last Modified by: 伊丽莎不白
 * @Last Modified time: 2019-07-17 15:08:09
 */
var UrlLoader = function () {};

UrlLoader.IO_ERROR = 'io_error';
UrlLoader.TIMEOUT_ERROR = 'timeout_error';
UrlLoader.COMPLETE = 'complete';
UrlLoader.WARN_LEVEL = 'warn';
UrlLoader.ERROR_LEVEL = 'error';
UrlLoader.POST = 'POST';
UrlLoader.GET = 'GET';

UrlLoader.prototype._request = function () {
	this._stats.aborted = false;

	var xhr;
	if (typeof XDomainRequest !== 'undefined') {
		xhr = new XDomainRequest();
	} else {
		xhr = new XMLHttpRequest();
	}
	this._xhr = xhr;

	xhr.onloadend = this._onLoadEnd.bind(this);

	this._startRetryTimer();
	xhr.open(this._method, this._url, true);

	xhr.responseType = this._responseType;
	if(this._method === UrlLoader.POST) {
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		xhr.send(this._postData);
	} else {
		xhr.send();
	}
};

UrlLoader.prototype._onLoadEnd = function (evt) {
	var xhr = evt.currentTarget;
	this._stats.httpStatus = xhr.status;
	if (!this._stats.aborted) {
		if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
			this._stopRetryTimer();
			this._stats.ed = new Date().getTime();
			this._loading = false;
			this._onComplete(evt, { type: UrlLoader.COMPLETE, stats: this._stats });
		} else {
			this._loadErrorRetry(evt, UrlLoader.IO_ERROR);
		}
	}
};

UrlLoader.prototype._startRetryTimer = function () {
	this._timerId = window.setTimeout(this._onTimeout.bind(this), this._timeout);
};

UrlLoader.prototype._stopRetryTimer = function () {
	if (this._timerId) {
		clearTimeout(this._timerId);
	}
};

UrlLoader.prototype._loadErrorRetry = function (evt, type) {
	this.abort();
	if (this._stats.retry < this._retry) {
		this._onError(evt, { type: type, level: UrlLoader.WARN_LEVEL, stats: this._stats });
		this._loading = true;
		this._stats.retry++;
		this._stats.aborted = false;
		this._startRetryDelay(this._stats.retry * this._retryDelay);
	} else {
		this._loading = false;
		this._onError(evt, { type: type, level: UrlLoader.ERROR_LEVEL, stats: this._stats });
	}
};

UrlLoader.prototype._onTimeout = function () {
	this._loadErrorRetry(UrlLoader.TIMEOUT_ERROR);
};

UrlLoader.prototype._startRetryDelay = function (delay) {
	this._retryDelayTimerId = window.setTimeout(this._onRetryDelay.bind(this), delay);
};

UrlLoader.prototype._stopRetryDelay = function () {
	if (this._retryDelayTimerId) {
		clearTimeout(this._retryDelayTimerId);
	}
};

UrlLoader.prototype._onRetryDelay = function () {
	this._request();
};

UrlLoader.prototype.load = function (url, responseType, onComplete, onError, method = 'GET', postData = null) {
	this._url = url;
	this._responseType = responseType;
	this._timeout = 6000;
	this._retry = 3;
	this._retryDelay = 500;
	this._method = method;
	this._postData = postData;

	this._onComplete = onComplete;
	this._onError = onError;
	this._stats = { url : url, retry: 0, aborted: false, st: new Date().getTime(), ed: 0, httpStatus: 0 };
	this._loading = true;
	
	this._request();
};

UrlLoader.prototype.abort = function () {
	var xhr = this._xhr;
	if (xhr && xhr.readyState !== 4) {
		this._stats.aborted = true;
		xhr.abort();
	}
	if(xhr && xhr.onloadend) {
		xhr.onloadend = null;
	}
	this._loading = false;
	this._stopRetryDelay();
	this._stopRetryTimer();
};

UrlLoader.prototype.destroy = function () {
	this.abort();
	this._xhr = null;
};

module.exports = UrlLoader;