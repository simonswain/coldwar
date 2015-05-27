var Vec3 = function(x, y, z){
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};

Vec3.prototype = {

  add: function(b){
    this.x = this.x + b.x;
    this.y = this.y + b.y;
    this.z = this.z + b.z;
    return this;
  },

  sub: function(other){
    this.x = this.x - other.x;
    this.y = this.y - other.y;
    this.z = this.z - other.z;
    return this;
  },

  minus: function(other){
    var x = this.x - other.x;
    var y = this.y - other.y;
    var z = this.z - other.z;
    return new Vec3(x, y, z);
  },

  minusXY: function(other){
    var x = this.x - other.x;
    var y = this.y - other.y;
    return new Vec3(x, y, 0);
  },

  range: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    var z = Math.abs(this.z - other.z);   
    return Math.sqrt( (x*x) + (y*y) + (z*z) );
  },


  range2: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    var z = Math.abs(this.z - other.z);   
    return (x*x) + (y*y) + (z*z);
  },

  rangeX: function(other) {
    var x = Math.abs(this.x - other.x);
    return x;
  },

  rangeXY: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    return Math.sqrt( (x*x) + (y*y) );
  },

  angleXYto: function(other) {
    var x = Math.abs(this.x - other.x);
    var y = Math.abs(this.y - other.y);
    var z = Math.abs(this.z - other.z);   
    return Math.sqrt( (x*x) + (y*y) + (z*z) );
  },

  mag: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  magSq: function () {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  angleXY: function () {
    return Math.atan2(this.y, this.x);
  },

  angleXZ: function () {
    return Math.atan2(this.z, this.x);
  },

  normalize: function () {
    var m = this.mag();
    if(m === 0){
      this.x = 0;
      this.y = 0;
      this.z = 0;
      return this;
    }
    this.x /= m;
    this.y /= m;
    this.z /= m;
    return this;
  },

  scale: function (s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
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
    this.z /= s;
    return this;
  },

  copy: function (a) {
    this.x = a.x;
    this.y = a.y;
    this.z = a.z;
    return this;
  },

  lerp:function(v, a){
    this.x += ( v.x - this.x ) * a;
    this.y += ( v.y - this.y ) * a;
    this.z += ( v.z - this.z ) * a;
    return this;
  },

  zero:function () {
    this.x = 0; 
    this.y = 0;
    this.z = 0;
    return this;
  }

};


var VecR = function(a, r){
  this.a = a || 0;
  this.r = r || 0;
};

VecR.prototype = {
  vec3: function(){
    var x = this.r * Math.cos(this.a);
    var y = this.r * Math.sin(this.a);
    var z = 0;
    return new Vec3(x, y, z);
  }
};
