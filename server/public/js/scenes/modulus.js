/* global Scenes */

Scenes.modulus = function (env, opts) {
  this.env = env
  this.opts = this.genOpts(opts)
  this.attrs = this.genAttrs()
  this.init()
}

Scenes.modulus.prototype = Object.create(Scene.prototype)

Scenes.modulus.prototype.title = 'Big Array'

Scenes.modulus.prototype.init = function () {
  this.index = 0;

  this.caps = [];
  for(var i = 0; i < 8; i++){
    this.caps.push(0);
  }

  this.snakeCell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
      hideWalls: true
    });

  this.pongCell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
      hideWalls: true
    });

  this.breederCell = new Actors.Cell(
    this.env, {
      scene: this
    }, {
      hideWalls: true
    });

  this.makeGrid();
  this.generatePerfectMaze();

}

Scenes.modulus.prototype.defaults = [{
  key: 'max_x',
  info: 'Max X',
  value: 480,
  min: 100,
  max: 1600
}, {
  key: 'max_y',
  info: 'Max Y',
  value: 480,
  min: 100,
  max: 1000
}]

Scenes.modulus.prototype.genAttrs = function () {
  return {
    time: 0,
    index: 0,
    value: 0,
    duration: 60,
    alpha: 0,
    level: 1,
    rows: 3,
    cols: 4
  }
}



Scenes.modulus.prototype.makeGrid = function () {
  // init blank grid

  var level = this.attrs.level % 4
  var cols, rows;

  rows = 3;
  cols = 4;
  if(this.attrs.level === 1){
    rows = 2;
    cols = 3;
  } else if(this.attrs.level === 2){
    rows = 4;
    cols = 5;
  } else if (this.attrs.level % 5 === 0 ) {
    rows = 6;
    cols = 7;
  } else if (this.attrs.level % 13 === 0 ) {
    rows = 3;
    cols = 3;
  } else {
    switch(level){
    case 0:
      rows = 4;
      cols = 7;
      break;
    case 1:
      rows = 4;
      cols = 7;
      break;
    case 2:
      rows = 4;
      cols = 5;
      break;
    case 3:
      rows = 5;
      cols = 8;
      break;
    }
  }

  this.cells = new Array(rows * cols);
  x = 0;
  y = 0;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    this.cells[i] = {
      i: i,
      x: x,
      y: y,
      exits: [
        null, null, null, null
      ],
      gridmates: [
        null, null, null, null
      ]
    };
    x ++;
    if(x === cols){
      x = 0;
      y ++;
    }
  }

  var dirs = [[0,-1], [1,0], [0,1], [-1,0]];
  var i, ix, exit;
  var other, cell;
  for (i = 0, ii = this.cells.length; i<ii; i++) {
    cell = this.cells[i]
    for (exit = 0; exit<4; exit++) {
      x = cell.x + dirs[exit][0];
      y = cell.y + dirs[exit][1];
      if(y<0 || x<0 || x>=cols || y>=rows){
        continue;
      }
      ix = (y * cols) + x;
      cell.gridmates[exit] = this.cells[ix]
    }
  }

  this.attrs.rows = rows;
  this.attrs.cols = cols;

}

Scenes.modulus.prototype.generatePerfectMaze = function () {

  var stack = [];
  var cells = this.cells
  var total = cells.length
  var cell
  var visited = 1;
  var n; // neighbours
  var i, j, k, c;
  var pick, other, dir;
  var flip = [2,3,0,1];

  var cell = pickOne(cells)
  while(visited < total){
    n = [];
    // find all neighbors of Cell with all walls intact
    for(i=0; i<4; i ++){
      if(cell.gridmates[i]){
        c = 0;
        other = cell.gridmates[i]
        for(j=0; j<4; j++){
          if(!other.exits[j]){
            c++;
          }
        }
        if(c === 4){
          n.push([i, other])
        }
      }
    }
    if(n.length > 0){
      pick = pickOne(n)
      dir = pick[0]
      other = pick[1]
      cell.exits[dir] = other
      other.exits[flip[dir]] = cell
      stack.push(cell)
      cell = other
      visited ++
    } else {
      cell = stack.pop()
    }
  }
}


Scenes.modulus.prototype.update = function (delta) {

  this.attrs.time += this.env.diff

  if (this.attrs.time > this.attrs.duration) {
    this.attrs.time = 0;

    this.attrs.value --;
    if(this.attrs.value < 0){
      this.attrs.value = 255;
    }
    for(var i = 0; i < 8; i++){
      this.caps[i] = (this.attrs.value & Math.pow(2, i));
    }
  }
  
  if(!this.cells){
    this.makeGrid();
    this.generatePerfectMaze();
  }

  this.attrs.alpha += delta * 0.05;
  if(this.attrs.alpha > 2 * Math.PI){
    this.attrs.alpha -= 2 * Math.PI;
    this.attrs.level ++;
    if(this.attrs.level > 15){
      this.attrs.level = 1;
    }
    this.makeGrid();
    this.generatePerfectMaze();
  }


  // this.index += delta * 0.02;
  // this.attrs.level =  Math.floor(this.index) + 1;
  // if(this.index > 25){
  //   this.index = 1;
  // }

  if(!this.snakeCell.snake) {
    this.snakeCell.addSnake();
  }
  this.snakeCell.update(delta);

  if(!this.pongCell.pong) {
    this.pongCell.addPong();
  }
  this.pongCell.update(delta);

  if(this.breederCell.breeders .length === 0) {
    this.breederCell.addBreeder();
  }
  this.breederCell.update(delta);

}

Scenes.modulus.prototype.paintLevel = function (gx) {

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }

  if(Date.now() % 1000 < 200){
    gx.ctx.fillStyle = 'rgba(0,0,0,1)';
  }

  if(Date.now() % 1000 > 950){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }

  gx.ctx.font = '56pt robotron';
  gx.ctx.textAlign='center'
  gx.ctx.textBaseline='middle'

  gx.ctx.fillText(this.attrs.level.toString(16).toUpperCase(), 0, 0);

}

Scenes.modulus.prototype.paintRes = function (gx) {

  var color;

  var level = this.env.level % 4
  var rows, cols;

  rows = this.attrs.rows;
  cols = this.attrs.cols;

  if (this.env.level % 4 === 0) {
    color = '153, 153, 0'
  }

  if (this.env.level % 7 === 0) {
    color = '153, 0, 153'
  }

  if (this.env.level > 6 && this.env.level % 3 === 0) {
    color = '0, 0, 204'
  }

  gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  gx.ctx.font = '24pt robotron';
  gx.ctx.textAlign='center'
  gx.ctx.textBaseline='middle'

  gx.ctx.fillText(rows + ' x ' + cols, 0, 0);

}


Scenes.modulus.prototype.paintGrid = function(gx, fx){

  rows = this.attrs.rows;
  cols = this.attrs.cols;

  var color;
  color = '255, 0, 0'

  if (this.attrs.level % 4 === 0) {
    color = '153, 153, 0'
  }

  if (this.attrs.level % 7 === 0) {
    color = '153, 0, 153'
  }

  if (this.attrs.level > 6 && this.attrs.level % 3 === 0) {
    color = '0, 0, 204'
  }

  gx.ctx.save();
  //gx.ctx.translate(this.opts.max_x * 0.35, this.opts.max_y * 0.4)
  //gx.ctx.scale(0.2, 0.2);

  var ww = this.opts.max_x / cols;
  var hh = this.opts.max_y / rows;

  ww = Math.min(ww, hh);
  hh = ww;

  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.15)
  gx.ctx.scale(0.4, 0.4);

  if(cols > rows) {
    gx.ctx.translate(0, ww * (cols - rows) / 2)
  }

  if(rows > cols) {
    gx.ctx.translate(ww * (rows - cols) / 2, 0)
  }

  gx.ctx.translate(- ww * cols / 2,  - hh * rows / 2)

  //var hh = this.opts.max_y / rows;

  gx.ctx.lineWidth = 6;
  gx.ctx.lineCap='round';
  gx.ctx.strokeStyle = 'rgba(' + color + ',' + ((Math.sin(this.attrs.alpha))) + ')';

  var x, y;

  for(var i = 0, ii = rows * cols; i < ii; i++){
    x = i % cols;
    y = Math.floor(i / cols);

    var cell = this.cells[i];

    // gx.ctx.fillStyle = 'rgba(' + color + ',1)';
    // gx.ctx.font = '32pt robotron';
    // gx.ctx.textAlign='center'
    // gx.ctx.textBaseline='middle'
    // gx.ctx.fillText(i, x * ww + (ww/2), y * hh + (hh/2));

    gx.ctx.save();

    if(!cell.exits[0]){
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

    if(!cell.exits[1]){
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

    if(!cell.exits[2]){
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

    if(!cell.exits[3]){
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

    gx.ctx.restore();

  }

  gx.ctx.restore();

}

Scenes.modulus.prototype.paintPowerup = function(gx, fx){

  var z = this.opts.scale;

  var alpha = (0.5-(Math.sin(Math.PI * (Date.now()%4000)/2000)/2));

  gx.ctx.save();
  //gx.ctx.scale(0.9, 0.9)

  //gx.ctx.font = this.opts.font_size + '28pt ubuntu mono';
  gx.ctx.font = '48pt robotron';
  gx.ctx.textAlign = 'center';
  gx.ctx.textBaseline = 'middle';

  var h = (Date.now()%360 * 0.22) - 10;
  gx.ctx.fillStyle = 'hsl(' + h + ', 100%, 50%)';

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,0,0.5)';
  }

  if(Math.random() < 0.025){
    gx.ctx.fillStyle = 'rgba(255,255,255,1)';
  }

  gx.ctx.fillText('POW', 0, 0)

  gx.ctx.restore();

}

Scenes.modulus.prototype.paintReactor = function(gx, fx){

  var rgb = '0, 153, 0';

  var arc = Math.PI/3;
  var r = 64;

  var view = gx;
  view.ctx.save();
  view.ctx.strokeStyle = 'rgba(255, 0, 255, 0.9)'
  view.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'
  var p = (this.env.ms / 2000) + 0.5;

  if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
    view.ctx.fillStyle = '#f0f'
  }

  view.ctx.beginPath()
  view.ctx.arc(0, 0, r, 0, 2*Math.PI)
  view.ctx.fill()
  view.ctx.stroke()

  view.ctx.strokeStyle = 'rgba(51, 0, 51, 1)'
  if(this.attrs.mode === 'primed' && this.env.ms / 100 < 1){
    view.ctx.strokeStyle = '#fff'
  }
  view.ctx.lineWidth = 8
  view.ctx.beginPath()
  view.ctx.rect(-r* 0.66, -r* 0.66, r * 0.66 * 2, r * 0.66 * 2)
  view.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)'
  view.ctx.stroke()

  view.ctx.lineWidth = 32

  if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
    view.ctx.strokeStyle = '#000'
  } else {
    view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
  }
  if(Math.random() < 0.1){
    view.ctx.strokeStyle = '#fff'
  }
  view.ctx.beginPath()
  view.ctx.arc(0, 0, r/2, 0, arc)
  view.ctx.stroke()

  if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
    view.ctx.strokeStyle = '#000'
  } else {
    view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
  }
  if(Math.random() < 0.1){
    view.ctx.strokeStyle = '#fff'
  }
  view.ctx.beginPath()
  view.ctx.arc(0, 0, r/2, 2*arc, 3*arc)
  view.ctx.stroke()

  if(this.attrs.mode === 'primed' && this.env.ms / 80 < 5){
    view.ctx.strokeStyle = '#000'
  } else {
    view.ctx.strokeStyle = 'rgba(255, 0, 255, ' + p + ')'
  }
  if(Math.random() < 0.1){
    view.ctx.strokeStyle = '#fff'
  }
  if(Math.random() < 0.1){
    view.ctx.strokeStyle = '#fff'
  }
  view.ctx.beginPath()
  view.ctx.arc(0, 0, r/2, 4*arc, 5*arc)
  view.ctx.stroke()


  // var z = r * 2;
  // if(this.env.ms / 100 < 1){
  //   view.ctx.strokeStyle = '#fff'
  //   view.ctx.lineWidth = 1
  //   view.ctx.beginPath()
  //   view.ctx.rect(-z/2, -z/2, z, z)
  //   view.ctx.stroke()
  // }
  view.ctx.restore();

}

Scenes.modulus.prototype.drawCap = function(gx, charge){

  var ww = 250;
  
  gx.ctx.strokeStyle = '#0ff';
  gx.ctx.lineWidth = 8;

  gx.ctx.fillStyle = 'rgba(255,0,255,' + charge + ')';
  gx.ctx.beginPath();
  gx.ctx.fillRect(
    ww * 0.3,
    ww * 0.4,    
    ww * 0.4,
    ww * 0.2    
  )

  gx.ctx.beginPath();
  gx.ctx.moveTo(ww * 0.5, ww * 0.2) 
  gx.ctx.lineTo(ww * 0.5, ww * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(ww * 0.3, ww * 0.4) 
  gx.ctx.lineTo(ww * 0.7, ww * 0.4)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(ww * 0.3, ww * 0.6) 
  gx.ctx.lineTo(ww * 0.7, ww * 0.6)
  gx.ctx.stroke();

  gx.ctx.beginPath();
  gx.ctx.moveTo(ww * 0.5, ww * 0.6) 
  gx.ctx.lineTo(ww * 0.5, ww * 0.8)
  gx.ctx.stroke();
  
}

Scenes.modulus.prototype.paintCaps = function (gx) {

  for(var i = 0; i < 4; i++){
    gx.ctx.save();
    gx.ctx.translate(150 * i, 0);
    this.drawCap(gx, this.caps[i]);
    gx.ctx.restore()
  }
  
}


Scenes.modulus.prototype.paintKing = function (view) {

  view.ctx.save()
  view.ctx.rotate(this.velo.angleXY())

  var ccc = '#c00'

  if(this.attrs.hit){
    this.attrs.hit = false;
    ccc = '#ff0';
  }
  
  view.ctx.fillStyle = '#c00'
  view.ctx.strokeStyle = '#c00'
  view.ctx.lineWidth = 1

  
  var z = 8

  // for tails
  var q1 = (Math.sin(this.attrs.phase/2) % (2*Math.PI));
  var q2 = (Math.sin(this.attrs.phase/3) % (2*Math.PI));

  // tail
  view.ctx.fillStyle = ccc
  view.ctx.strokeStyle = ccc
  view.ctx.save()
  view.ctx.translate(-1.5*z, 0)
  view.ctx.beginPath()
  view.ctx.moveTo(0, 0.5*z)
  view.ctx.quadraticCurveTo(-5*z, z * q1, -5 * z, 0)
  view.ctx.quadraticCurveTo(-5*z, z * q1, 0, -0.5*z)
  view.ctx.closePath()
  view.ctx.stroke()
  view.ctx.fill()
  view.ctx.restore()

  // body
  view.ctx.fillStyle = ccc
  view.ctx.lineWidth = 1
  view.ctx.beginPath()
  view.ctx.ellipse(0, 0, z * 2.5, z * 1.2, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  // head
  view.ctx.save()
  view.ctx.translate(2.2*z, 0)
  view.ctx.rotate(q2 * 0.3)

  // whiskers
  view.ctx.strokeStyle = ccc
  view.ctx.lineWidth=0.5

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.7, -z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.9, -z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.7, z)
  view.ctx.stroke()

  view.ctx.beginPath()
  view.ctx.moveTo(z*0.8, 0)
  view.ctx.lineTo(z*0.9, z)
  view.ctx.stroke()

  // skull
  view.ctx.fillStyle = ccc
  view.ctx.beginPath()
  view.ctx.ellipse(0, 0, z * 1.2, z * 0.7, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  //eyes
  view.ctx.fillStyle = '#ff0'
  // blink
  if(Math.random() < 0.1){
    view.ctx.fillStyle = '#000'
  }
  view.ctx.beginPath()
  view.ctx.ellipse(z * 0.8, -z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
  view.ctx.closePath()

  view.ctx.fill()
  view.ctx.beginPath()
  view.ctx.ellipse(z * 0.8, z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
  view.ctx.closePath()
  view.ctx.fill()

  view.ctx.restore()
  // end head


  view.ctx.restore()
}

Scenes.modulus.prototype.paint = function (fx, gx, sx) {

  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.55)
  this.paintLevel(gx);
  gx.ctx.restore();

  // maze
  this.paintGrid(gx, fx);

  if(this.attrs.level % 4 === 0 ) {
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0, this.opts.max_y * 0.25)
    gx.ctx.rotate(-Math.PI * 0.25);
    gx.ctx.scale(0.17, 0.17);
    this.paintCaps(gx, fx);
    gx.ctx.restore();
  }

  if(this.attrs.level % 7 === 0 ) {
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0, this.opts.max_y * 0.25)
    gx.ctx.rotate(-Math.PI * 0.25);
    gx.ctx.scale(0.2, 0.2);
    this.paintCaps(gx, fx);
    gx.ctx.restore();
  }
  
  // reactor
  gx.ctx.save();
  gx.ctx.translate(this.opts.max_x * 0.5, this.opts.max_y * 0.85)
  gx.ctx.scale(0.45, 0.45);
  this.paintReactor(gx, fx);
  gx.ctx.restore();

  // breeder
  
  if(this.attrs.level !== 12) {
    fx.ctx.save();
    fx.ctx.translate(this.opts.max_x * 0.8, this.opts.max_y * 0.75);
    fx.ctx.scale(0.2, 0.2);
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0.8, this.opts.max_y * 0.75);
    gx.ctx.scale(0.2, 0.2);
    this.breederCell.paint(gx, gx)
    gx.ctx.restore();
    fx.ctx.restore();
  }
  
  // snake
  if(this.attrs.level > 2 ) {
    fx.ctx.save();
    fx.ctx.translate(this.opts.max_x * 0.4, this.opts.max_y * 0.75);
    fx.ctx.scale(0.2, 0.2);
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0.8, this.opts.max_y * 0.4);
    gx.ctx.scale(0.2, 0.2);
    this.snakeCell.paint(gx, fx)
    gx.ctx.restore();
    fx.ctx.restore();
  }

  // pong
  if(this.attrs.level > 4 ) {
    fx.ctx.save();
    fx.ctx.translate(this.opts.max_x * 0.0, this.opts.max_y * 0.4);
    fx.ctx.scale(0.15, 0.15);

    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0.0, this.opts.max_y * 0.4);
    gx.ctx.scale(0.15, 0.15);
    this.pongCell.paint(gx, fx)
    gx.ctx.restore();
    fx.ctx.restore();
  }


  // pow
  if(this.attrs.level > 6) {
    gx.ctx.save();
    gx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.85);
    gx.ctx.scale(0.3, 0.3);
    this.paintPowerup(gx)
    gx.ctx.restore();
  }

  // king
  if(this.attrs.level %7 === 0) {

    var view = gx;
    
    var ccc = '#c00'
    view.ctx.fillStyle = '#c00'
    view.ctx.strokeStyle = '#c00'
    view.ctx.lineWidth = 1
    
    gx.ctx.save()
    gx.ctx.translate(this.opts.max_x * 0.9, this.opts.max_y * 0.2);
    gx.ctx.scale(0.4, 0.4);

    gx.ctx.rotate(Math.sin((Date.now()/1000) % (2*Math.PI)) - Math.PI*0.5)

    var view = gx;
    var z = 24

    // for tails
    var q1 = (Math.sin((Date.now()/125) % (2*Math.PI)));
    var q2 = (Math.sin((Date.now()/333) % (2*Math.PI)));

    // tail
    view.ctx.fillStyle = ccc
    view.ctx.strokeStyle = ccc
    view.ctx.save()
    view.ctx.translate(-1.5*z, 0)
    view.ctx.beginPath()
    view.ctx.moveTo(0, 0.5*z)
    view.ctx.quadraticCurveTo(-5*z, z * q1, -5 * z, 0)
    view.ctx.quadraticCurveTo(-5*z, z * q1, 0, -0.5*z)
    view.ctx.closePath()
    view.ctx.stroke()
    view.ctx.fill()
    view.ctx.restore()

    // body
    view.ctx.fillStyle = ccc
    view.ctx.lineWidth = 1
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 2.5, z * 1.2, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    // head
    view.ctx.save()
    view.ctx.translate(2.2*z, 0)
    view.ctx.rotate(q2 * 0.3)

    // whiskers
    view.ctx.strokeStyle = ccc
    view.ctx.lineWidth=0.5

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, -z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.7, z)
    view.ctx.stroke()

    view.ctx.beginPath()
    view.ctx.moveTo(z*0.8, 0)
    view.ctx.lineTo(z*0.9, z)
    view.ctx.stroke()

    // skull
    view.ctx.fillStyle = ccc
    view.ctx.beginPath()
    view.ctx.ellipse(0, 0, z * 1.2, z * 0.7, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    //eyes
    view.ctx.fillStyle = '#ff0'
    // blink
    if(Math.random() < 0.1){
      view.ctx.fillStyle = '#000'
    }
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, -z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()

    view.ctx.fill()
    view.ctx.beginPath()
    view.ctx.ellipse(z * 0.8, z*0.2, z * 0.1, z * 0.05, 0, 2*Math.PI, 0);
    view.ctx.closePath()
    view.ctx.fill()

    view.ctx.restore()
    // end head


    view.ctx.restore()
  }

  // // human

  // gx.ctx.save()
  // gx.ctx.translate(this.opts.max_x * 0.1, this.opts.max_y * 0.5);
  // gx.ctx.scale(0.5, 0.5);

  // gx.ctx.rotate(Date.now() /1000 % (2*Math.PI))

  // gx.ctx.fillStyle = '#022'
  // gx.ctx.strokeStyle = '#0ff'
  // gx.ctx.lineWidth = 1

  // var z = 32
  // gx.ctx.lineWidth = 8

  // gx.ctx.beginPath()
  // gx.ctx.rect(-z ,-z-z, z, z+z+z+z)
  // gx.ctx.stroke()

  // gx.ctx.beginPath()
  // gx.ctx.moveTo(z, 0)
  // gx.ctx.lineTo(-z, z)
  // gx.ctx.lineTo(-z, -z)
  // gx.ctx.lineTo(z, 0)
  // gx.ctx.closePath()
  // gx.ctx.fill()
  // gx.ctx.stroke()

  // gx.ctx.restore()



}
