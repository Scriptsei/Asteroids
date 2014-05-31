/*************************************/
/* MODEL DEFINITIONS
/* Define them as a group of tris, for easy rendering
/*************************************/

var BACKDROP_VERTS = [
	-1,1,0,
	1,1,0,
	1,-1,0,
	-1,-1,0
];

var BACKDROP_TRIS = [
	0.0,0.0,
	0.0,1.0,
	1.0,1.0,
	1.0,0.0
];

var BACKDROP_UVS = [
	0,1,2,
	0,2,3
];


var ASTEROID_VERTS = [
	 0.0, 0.0, 0.0,
	 0.04*Math.cos(0), 0.04*Math.sin(0), 0,
	 0.04*Math.cos(Math.PI/6), 0.04*Math.sin(Math.PI/6), 0,
	 0.04*Math.cos(2*Math.PI/6), 0.04*Math.sin(2*Math.PI/6), 0,
	 0.04*Math.cos(Math.PI/2), 0.04*Math.sin(Math.PI/2), 0,
	 0.04*Math.cos(4*Math.PI/6), 0.04*Math.sin(4*Math.PI/6), 0,
	 0.04*Math.cos(5*Math.PI/6), 0.04*Math.sin(5*Math.PI/6), 0,
	 0.04*Math.cos(Math.PI), 0.04*Math.sin(Math.PI), 0,
	 0.04*Math.cos(7*Math.PI/6), 0.04*Math.sin(7*Math.PI/6), 0,
	 0.04*Math.cos(8*Math.PI/6), 0.04*Math.sin(8*Math.PI/6), 0,
	 0.04*Math.cos(9*Math.PI/6), 0.04*Math.sin(9*Math.PI/6), 0,
	 0.04*Math.cos(10*Math.PI/6), 0.04*Math.sin(10*Math.PI/6), 0,
	 0.04*Math.cos(11*Math.PI/6), 0.04*Math.sin(11*Math.PI/6), 0

];

var ASTEROID_TRIS = [
	0,1,2,
	0,2,3,
	0,3,4,
	0,4,5,
	0,5,6,
	0,6,7,
	0,7,8,
	0,8,9,
	0,9,10,
	0,10,11,
	0,11,12,
	0,12,1
];

var ASTEROID_UVS =
[
	 0.5,0.5,
	 Math.cos(0), 0.5 + Math.sin(0),
	 0.5 + Math.cos(Math.PI/6)/2, 0.5 + Math.sin(Math.PI/6)/2,
	 0.5 + Math.cos(2*Math.PI/6)/2, 0.5 + Math.sin(2*Math.PI/6)/2,
	 0.5 + Math.cos(Math.PI/2)/2, 0.5 + Math.sin(Math.PI/2)/2,
	 0.5 + Math.cos(4*Math.PI/6)/2, 0.5 + Math.sin(4*Math.PI/6)/2,
	 0.5 + Math.cos(5*Math.PI/6)/2, 0.5 + Math.sin(5*Math.PI/6)/2,
	 0.5 + Math.cos(Math.PI)/2, 0.5 + Math.sin(Math.PI)/2,
	 0.5 + Math.cos(7*Math.PI/6)/2, 0.5 + Math.sin(7*Math.PI/6)/2,
	 0.5 + Math.cos(8*Math.PI/6)/2, 0.5 + Math.sin(8*Math.PI/6)/2,
	 0.5 + Math.cos(9*Math.PI/6)/2, 0.5 + Math.sin(9*Math.PI/6)/2,
	 0.5 + Math.cos(10*Math.PI/6)/2, 0.5 + Math.sin(10*Math.PI/6)/2,
	 0.5 + Math.cos(11*Math.PI/6)/2, 0.5 + Math.sin(11*Math.PI/6)/2
];

/*var SHIP_VERTS = [
	 0.0,  0.0,  0.0,
	 -0.025,  0.025,  0.0,
	 0.0,  0.05,  0.0,

	 0.0,  0.0,  0.0,
	 0.025,  0.025,  0.0,
	 0.0,  0.05,  0.0,

	 0.0,  0.0,  0.0,
	 -0.025,  0.025,  0.0,
	 -0.05, -0.02,  0.0,

	 0.0,  0.0,  0.0,
	 0.025, 0.025,  0.0,
	 0.05, -0.02,  0.0,

	 0.0,  0.0,  0.0,
	 -0.025,  -0.01,  0.0,
	 0.025,  -0.01,  0.0,
];*/

var SHIP_VERTS = [
	0.0, 0.0, 0.0,
   -0.025,  0.025,  0.0,
	0.0,  0.05,  0.0,
    0.025,  0.025,  0.0,
   -0.05, -0.02,  0.0,
	0.05, -0.02,  0.0,
   -0.025,  -0.01,  0.0,
	0.025,  -0.01,  0.0
];

var SHIP_TRIS = [
	0,1,2,
	0,2,3,
	0,1,4,
	0,3,5,
	0,6,7

];

var MISSILE_VERTS = [
	0.0, 0.0, 0.0,
	0.0, 0.02, 0.0,
    0.0025, 0.0025,  0.0,
   -0.0025, 0.0025,  0.0,
	0.0, -0.005,  0.0,
	0.0025, -0.005,  0.0,
   -0.0025, -0.005,  0.0
];

var MISSILE_TRIS = [
	0,1,2,
	0,1,3,
	0,2,5,
	0,3,6,
	0,4,5,
	0,4,6
];