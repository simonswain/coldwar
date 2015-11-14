function Actor(){
}

Actor.prototype.genOpts = function(args){
  var opts = {};
  this.defaults.forEach(function(param){
    if(args && args.hasOwnProperty(param.key)){
      opts[param.key] = Number(args[param.key]);
    } else {
      opts[param.key] = param.value;
    }
  }, this);
  return opts;
};

