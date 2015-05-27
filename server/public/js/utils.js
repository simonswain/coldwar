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
