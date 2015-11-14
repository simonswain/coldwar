function pickOne(arr){
  if(arr.length === 0){
    return null;
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// #fff to 255,255,255
function hex2rgb(hex, f){
  if(!f){
    f = 16;
  }
  var rgb = [];
  rgb.push(parseInt(hex.substr(1,1), 16) * f);
  rgb.push(parseInt(hex.substr(2,1), 16) * f);
  rgb.push(parseInt(hex.substr(3,1), 16) * f);
  return rgb.join(',');
}

function dec2hex(d, padding) {
  var hex = Number(d).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
  while (hex.length < padding) {
    hex = "0" + hex;
  }
  return hex;
}

function random0to (max) {
  return Math.floor( Math.random() * max );
}

function random1to (max) {
  return 1 + Math.floor( Math.random() * max );
}

var random = {
  from0upto: function (max) {
    return Math.floor( Math.random() * (max));
  },
  from0to: function (max) {
    return Math.floor( Math.random() * (max + 1));
  },
  from1to: function (max) {
    return 1 + Math.floor( Math.random() * max );
  }
};
