# Cold War

![](http://i.imgur.com/PNsaof4.gif) 

## Install

```bash
git clone git@github.com:simonswain/coldwar.git
cd coldwar
cp config/index.sample.js config/index.js
npm install
node run

# http://localhost:3002
```

## Shortcuts

Press `?` for help.

Press `\` for diagnostics.

## About

There are two views, top view and elevation view. All the actors have an x, y and z.

Each of the circle structures is a nation state.

It has a capital at the center (square, blinking). Defcon is the number in the capital.

Cities (circles) send people to work at factories.

Factories (triangles) make munitions and send them to bases

Bases (square) stockpile munitions (counts, clockwise from top right: icbms, abms (anti ballistic missiles), 
fighters and bombers.

Bombers are big and slow (triangles) that select a target (factory, base, city, capital in that order), fly to it 
and nuke it, reselecting a target if somebody else destroys it first.

As defence perimeters are penetrated, defcon gets more scary.

Fighters launch at Defcon 4 and attempt to destroy bombers.

At Defcon 3, Bases launch ICBMs a low probability amount of the time.

Satellites launch at Defcon 2, and can shoot ICBMs out of the sky, but have fire/recharge lasers.

When one of a nation's assets (factory, base, city) is nuked, they go to Defcon 1.

If your enemy goes to Defcon 1, so do you.

At Defcon 1, all ICBMs will fire.

When your capital is destroyed, it's Game Over.

The control panel lets you tweak the starting parameters. There are a lot more controls for all the actors (e.g, how close do bombers flock.) than are not exposed here.

## References

* [SAGE](https://www.youtube.com/results?search_query=sage+computer)
* [Cold War, Hot Jets](https://www.youtube.com/watch?v=oJtzyFRy2Ko)
* [Wargames](https://www.youtube.com/watch?v=NHWjlCaIrQo)
* [Fail Safe](https://www.youtube.com/watch?v=-9R3w8wDrmM)
* [Thirteen Days](https://www.youtube.com/watch?v=-yfIoHXOO9E)
* [Seven Days in May](https://www.youtube.com/watch?v=nwMjiArJFhM)
* [Dr Strangelove](https://www.youtube.com/watch?v=vuP6KbIsNK4)
* [Major Havoc](https://www.youtube.com/watch?v=rbq1LE9MJc0)
* [History of Game Graphics](https://www.youtube.com/watch?v=dzN2pgL0zeg&index=1&list=PLOQZmjD6P2HlOoEVKOPaCFvLnjP865X1f)
* [Cold War Britain](https://www.youtube.com/watch?v=TZi_rrZX4bo)
* [The Power of Decision](https://www.youtube.com/watch?v=q2v0YuDatpc)

## History

2015-05-27 0.0.1 Initial public release

MIT Licence
