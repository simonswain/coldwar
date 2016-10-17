The maze is exists as a grid

But we represent the maze in memory as a one dimensional array.

We can easily translate between the x-y coordinates of the cells in our grid, and the indexes of those cells in our array

Each cell in the grid has a four element neighbour array, each element of which is either null if that side of the cell is closed, or holding the reference to that side’s neighbour.

We can join two cells together by having them store references to each other as neighbours.

When we create the maze, we start with a grid of unconnected cells.

Pick a cell, any cell.

Pick a neighbour of that cell at random, ensuring that neighbour has no connections to any other cells.

Create mutual references to the exits on both cells so they are connected.

Push the cell you came from on a stack

Repeat the sequence from the neighbour, until you can’t find any more unconnected cells to visit.

Backtrack down the stack, following up any unconnected cells you find along the way, and when the stack is empty, you have a perfect maze!

***

Each cell in the grid is a self-contained simulation. It it has a floorspace and collections of actors that interact with each other within that space.

Some cells have a special object in them also, like a reactor or rat factory

A game loop runs 60 times a second, driven by window.requestAnimationFrame.
We iterate through all the cells, and each actor in those cells.

Sixty times a second, the maze updates. Each cell gets a chance to iterate through it's actors so they can observe their environment and perform their behaviours.

Each actor observes the activity of the cell it’s in and uses thes observations to drive it’s actions

When an actor moves to the edge of a cell and the edge is closed, movement is restricted and they reflect off. The walls exert a kind of mathematical asymtopic short-range reverse gravity.

If the cell is connected to another, the actor is removed from their current cell and placed in the connected one, with a bit of math to put it in the correct position.

When a rat reaches the edge of a cell, if that edge is a wall, a force is applied to the rat to reflect it away, but if there is no exit, the rat is removed from it's current cell, a bit of math done on it's x-y coordinates, and it is placed in the adjacent cell.

The human will run and shoot rats, rats will chase the human

Some actors are influenced bt larger factors

The killer rats want to move towards the cell the human is in

The human has an overriding urge to follow the path to the reactor and then to escape

The human calculates the path from it’s current location to it’s destination, which will be either the reactor, or egress.

Since our perfect maze lets us get from any cell to any other cell, the reactor is always reachable from the ingress

We determine the path through the maze using an algorithm known as A*

It goes something like this

(a*)

(maze solving algo explain here) … and determine the path through the maze

We can place objects strategically along this path or place them off the path, depnding on the effect we want them to have on the game

The direction of the next step in it’s path is applied as a movement intention, which competes with other intentions, like avoiding or chasing enemies, and reflecting off walls.

There are some other tricks we can do with our path

We need to seed the maze at the start of each level


The first cell in our maze is always the ingress our human enters through

The last cell is always the reactor.

As the human progresses through the levels, the mazes get larger, with more devious entities hiding in them.

A level counter is incremented each time a maze is completed. 

The first few levels are preconfigured, but beyond that certain levels

The first four levels are hard-coded, but beyond that, some neat tricks are employed to create the illusion of forethought.

If we take a level number and apply modulus some number to it e.g. (level % 5) then for multiples of that number we get a zero. When our level hits a certain number, we activate an effect,

for example. every 3rd level zooms to follow the Human. Every 5th level has extra powerups, Every 13th level is a tiny maze.

At some higher levels these effects synchronize, creating unpredictable, exciting interactions.

The human will always follow the path from the ingress to the reactor and bck

We can treat this path as linear. We pick points at random, or according to some rules and place items on the cells referenced by those points.

We can also place items off the path. When placing a Breeder, we pick a cell at random; if the cell happens to be on the path, we try again until we find a cell that is not on the path.


Once we have generated and populated the maze, we start our game loop.


Rats follow a basic flocking algorithm, where they group together while maintaining some distance from their neighbours, but behave a little differently depending on their phase of life.

Killer Rats generally want to move towards the human to devour it’s flesh, this is their overpowering urge. 

It would be too expensive to calculate the path through the maze for each individual rat, so before updating it's rats, each cell calculates the path. 

This lets us determine which exit will move the rat closer to the human, The direction to this exit is applied as a movement intention to each rat in the cell.


You can see this manifest in the rat's movement at the junctions between cells, especially when the human is near. It is kind of a bug, but creates some nice effects
