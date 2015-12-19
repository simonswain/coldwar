/* global Actors, Actor, Vec3, VecR */

Actors.Tone = function (env, refs, attrs) {
  this.env = env
  this.refs = refs
  this.opts = this.genOpts()
  this.attrs = this.genAttrs(attrs)
  this.init(attrs)
}

Actors.Tone.prototype = Object.create(Actor.prototype)

Actors.Tone.prototype.title = 'Tone'

Actors.Tone.prototype.defaults = [{
  key: 'max_x',
  value: 640,
  min: 32,
  max: 1024
}, {
  key: 'max_y',
  value: 480,
  min: 32,
  max: 1024
}, {
  key: 'max_z',
  value: 1,
  min: 1,
  max: 1
}, {
  key: 'fft_smoothing',
  value: 0.6,
  min: 0.1,
  max: 1,
  step: 0.1
}, {
  key: 'fat',
  value: 3,
  min: 0,
  max: 8
}, {
  key: 'fft_size',
  value: 1024,
  min: 1024,
  max: 1024
}, {
  key: 'filter_type',
  value: 0,
  min: 0,
  max: 1
}, {
  key: 'filter_f',
  value: 2500,
  min: 0,
  max: 5000
}, {
  key: 'osc1_wave',
  value: 2,
  min: 0,
  max: 3
}, {
  key: 'osc1_f',
  value: 349.2,
  min: 1,
  max: 1000
}, {
  key: 'osc1_detune',
  value: 0,
  min: -50,
  max: 50
}, {
  key: 'osc1_amp',
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.1
}, {
  key: 'osc2_wave',
  value: 1,
  min: 0,
  max: 3
}, {
  key: 'osc2_f',
  value: 220,
  min: 1,
  max: 1000
}, {
  key: 'osc2_detune',
  value: 0,
  min: -50,
  max: 50
}, {
  key: 'osc2_amp',
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.1
}]

Actors.Tone.prototype.genAttrs = function (attrs) {

  var hp = this.opts.hp_base + (this.opts.hp_flux * Math.random())

  return {
    speed: this.opts.speed_base + (Math.random() * this.opts.speed_flux),
    color: attrs.color || '#fff',
    dead: false,
    hp: hp,
    hp_max: hp,
  }
}

Actors.Tone.prototype.init = function (attrs) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  if (!window.audiocontext) {
    window.audiocontext = new window.AudioContext()
  }
  this.ctx = window.audiocontext

  var filters = ['lowpass', 'highpass']

  this.filter = this.ctx.createBiquadFilter()
  this.filter.type = filters[this.opts.filter_type]
  this.filter.frequency.value = this.opts.filter_f
  this.filter.connect(this.ctx.destination)

  this.mix = this.ctx.createChannelMerger(2)
  this.mix.connect(this.filter)

  this.amp1 = this.ctx.createGain()
  this.amp1.gain.value = this.opts.osc1_amp
  this.amp1.connect(this.mix)

  this.amp2 = this.ctx.createGain()
  this.amp2.gain.value = this.opts.osc2_amp
  this.amp2.connect(this.mix)

  var waves = ['sine', 'square', 'sawtooth', 'triangle']

  this.osc1 = this.ctx.createOscillator()
  this.osc1.type = waves[this.opts.osc1_wave]
  this.osc1.frequency.value = this.opts.osc1_f
  this.osc1.detune = this.opts.osc1_detune
  this.osc1.connect(this.amp1)

  this.osc2 = this.ctx.createOscillator()
  this.osc2.type = waves[this.opts.osc2_wave]
  this.osc2.frequency.value = this.opts.osc2_f
  this.osc2.detune = this.opts.osc2_detune
  this.osc2.connect(this.amp2)

  this.analyser = this.ctx.createAnalyser()
  this.analyser.fftSize = this.opts.fft_size
  this.bufferLength = this.analyser.frequencyBinCount
  this.filter.connect(this.analyser)

  this.freqs = new Uint8Array(this.bufferLength)
  this.times = new Uint8Array(this.bufferLength)

  //this.osc1.start(0)
  //this.osc2.start(0) 
}

Actors.Tone.prototype.stop = function () {
  this.analyser.disconnect(0)
  this.analyser = null

  this.filter.disconnect(0)
  this.filter = null

  this.mix.disconnect(0)
  this.mix = null

  this.amp1.disconnect(0)
  this.amp1 = null

  this.amp2.disconnect(0)
  this.amp2 = null

  this.osc1.stop(0)
  this.osc1.disconnect(0)
  this.osc1 = null

  this.osc2.stop(0)
  this.osc2.disconnect(0)
  this.osc2 = null
}


Actors.Tone.prototype.update = function (delta) { 
}

Actors.Tone.prototype.paint = function (view) {

}
