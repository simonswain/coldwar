var Vec2 = function(x, y){
  this.x = x || 0;
  this.y = y || 0;
};

Vec2.prototype = {

  add: function(b){
    this.x = this.x + b.x;
    this.y = this.y + b.y;
    return this;
  },

  sub: function(other){
    this.x = this.x - other.x;
    this.y = this.y - other.y;
    return this;
  },

  minus: function(other){
    var x = this.x - other.x;
    var y = this.y - other.y;
    return new Vec2(x, y);
  },

  minusXY: function(other){
    var x = this.x - other.x;
    var y = this.y - other.y;
    return new Vec2(x, y, 0);
  },

  range: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    return Math.sqrt( (x*x) + (y*y) );
  },


  range2: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    return (x*x) + (y*y);
  },

  angleTo: function(other) {
    var x = this.x - other.x;
    var y = this.y - other.y;
    return Math.atan2(y, x);
  },

  mag: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },

  magSq: function () {
    return this.x * this.x + this.y * this.y;
  },

  angle: function () {
    return Math.atan2(this.y, this.x);
  },

  normalize: function () {
    var m = this.mag();
    if(m === 0){
      this.x = 0;
      this.y = 0;
      return this;
    }
    this.x /= m;
    this.y /= m;
    return this;
  },

  scale: function (s) {
    this.x *= s;
    this.y *= s;
    return this;
  },

  limit: function (max) {
    if(this.mag() > max){
      this.normalize();
      this.scale(max);
    }
    return this;
  },

  div: function (s) {
    this.x /= s;
    this.y /= s;
    return this;
  },

  copy: function (a) {
    this.x = a.x;
    this.y = a.y;
    return this;
  },

  lerp:function(v, a){
    this.x += ( v.x - this.x ) * a;
    this.y += ( v.y - this.y ) * a;
    return this;
  },

  zero:function () {
    this.x = 0;
    this.y = 0;
    return this;
  },

  plus: function(b){
    var vec = new Vec2(this.x, this.y);
    return vec.add(b);
  },

};
