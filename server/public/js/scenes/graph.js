/*global Scenes:true, Actors:true */
/*jshint browser:true */
/*jshint strict:false */
/*jshint latedef:false */

Scenes.graph = function(env, opts){
  this.env = env;
  this.opts = this.genOpts(opts);
  this.attrs = this.genAttrs();
  this.init();
};

Scenes.graph.prototype = Object.create(Scene.prototype);

Scenes.graph.prototype.title = 'Graph';

Scenes.graph.prototype.layout = '';

Scenes.graph.prototype.init = function(){
  this.ix = 0;
  this.memory = [];
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    this.memory.push([true, true, true, true]);
  }

  this.cage = new Actors.Cage(
    this.env, {
      scene: this
    }, {
    });

}

Scenes.graph.prototype.getCast = function(){
  return {
  }
};

Scenes.graph.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'rows',
  value: 3,
  min: 3,
  max: 24
}, {
  key: 'cols',
  value: 3,
  min: 8,
  max: 32
}, {
  key: 'duration',
  value: 60,
  min: 1,
  max: 120
}];

Scenes.graph.prototype.genAttrs = function(){
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: this.opts.duration,
  };
};

Scenes.graph.prototype.update = function(delta){

  this.cage.update(delta)

  if(this.cage.rats.length < 2 && Math.random() < 0.05){
    this.cage.addRat();
  }

  this.attrs.time += delta * 0.025;
  if(this.attrs.time > 1){
    this.attrs.time -= 1;
    this.ix ++;
    if(this.ix > 4){
      this.ix = 0;
    }
  }
}

Scenes.graph.prototype.paint = function(fx, gx, sx){

  this.cage.paint(gx)

  var ww = this.opts.max_x / this.opts.rows;
  var hh = this.opts.max_y / this.opts.cols;

  gx.ctx.save();
  
  gx.ctx.translate(this.opts.max_x * 0.05, this.opts.max_y * 0.05);
  gx.ctx.scale(0.9, 0.9);
  
  gx.ctx.lineWidth = 6;
  gx.ctx.strokeStyle = '#0f0';

  var points = [
    [0,false, true, false, false,1,0],
    [1,false, false, true, true,4,1],
    [4,true, false, true, false,7,1],
    [7,true, true, false, false,8,0],
    [8,false, false, false, true,null],
  ];

  var cells = [
    [true, false, true, true],
    [true, true, false, false],
    [true, true, true, true],

    [true, true, true, true],
    [false, true, false, true],
    [true, true, true, true],

    [true, true, true, true],
    [false, false, true, true],
    [true, true, true, false],

    [false, false, true, true],
    [true, false, true, false],
    [true, true, false, false],
    [false, false, false, true],
  ];
  
  var x, y, xx, yy, val;
  
  for(var i = 0, ii=this.opts.rows * this.opts.cols; i < ii; i++){
    x = i % this.opts.cols;
    y = Math.floor(i / this.opts.rows);

    gx.ctx.save();
    
    gx.ctx.lineWidth = 6;

    val = cells[i];

    gx.ctx.lineCap='round';
    //gx.ctx.save();
    // gx.ctx.translate(ww * x * 0.1, hh * y * 0.1);
    // gx.ctx.scale(0.9, 0.9);
    

    if(i === points[this.ix][0]){
      gx.ctx.strokeStyle = '#f00';
      gx.ctx.fillStyle = '#f00';
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.fill();

      // gx.ctx.fillStyle = '#000';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      // gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);

      xx = x;
      yy = y;
      
    }
    
    
    gx.ctx.strokeStyle = '#0f0';

    if(val[0]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.stroke();
    }

    if(val[1]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh)
      )
      gx.ctx.lineTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(val[2]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww) + ww,
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww) ,
        (y * hh) + hh
      )
      gx.ctx.stroke();
    }

    if(val[3]){
      gx.ctx.beginPath();
      gx.ctx.moveTo(
        (x * ww),
        (y * hh) + hh
      )
      gx.ctx.lineTo(
        (x * ww),
        (y * hh)
      )
      gx.ctx.stroke();
    }
    
    if(i === points[this.ix][0]){
    } else if(points[this.ix] === i){
      gx.ctx.strokeStyle = '#ff0';
      gx.ctx.beginPath();
      gx.ctx.rect((x * ww), (y * hh), ww, hh);
      gx.ctx.stroke();

      // gx.ctx.fillStyle = '#ff0';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      // gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);
      

    } else { 
      // gx.ctx.fillStyle = '#fff';
      // gx.ctx.font = '48pt robotron';
      // gx.ctx.textAlign='center';
      // gx.ctx.textBaseline='middle';
      // gx.ctx.fillText(i, ww/2 + x * ww, hh/2 + y * hh);
    }

    gx.ctx.restore();
    
  }

  
  if(points[this.ix][5]){
    gx.ctx.save();
    gx.ctx.translate((xx * ww) + ww/2 , (yy * ww) + ww/2);   
    gx.ctx.rotate(points[this.ix][6] * Math.PI / 2);   
    gx.ctx.lineCap='round';
    gx.ctx.strokeStyle = '#fff'; 
    gx.ctx.beginPath();
    gx.ctx.moveTo(ww * 0.25, 0)
    gx.ctx.lineTo(ww * 0.75, 0)
    gx.ctx.stroke();      
    gx.ctx.moveTo(ww * 0.65, -ww * 0.1)
    gx.ctx.lineTo(ww * 0.75, 0)
    gx.ctx.stroke();      
    gx.ctx.moveTo(ww * 0.65, ww * 0.1)
    gx.ctx.lineTo(ww * 0.75, 0)
    gx.ctx.stroke();      

    // gx.ctx.fillStyle = '#fff';
    // gx.ctx.font = '24pt robotron';
    // gx.ctx.textAlign='center';
    // gx.ctx.textBaseline='middle';
    // gx.ctx.fillText(points[this.ix][5], ww/3, - hh/5);

    gx.ctx.restore();
  }
  
  gx.ctx.restore();
  
}
