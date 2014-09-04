Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
}
Date.prototype.addSeconds = function(s) {
	this.setSeconds(this.getSeconds() + s);
	return this;
}