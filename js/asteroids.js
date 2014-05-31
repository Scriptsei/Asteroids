/*************************************/
/* CONSTANTS
/*************************************/
var MAX_RADIUS = 0.5;
var MIN_RADIUS = 0.5;
var MAX_VELOCITY = 2;
var MAX_X = 1;
var MAX_Y = 1;
var RATE_OF_FIRE = 500;

/*************************************/
/* GLOBALS
/*************************************/
var gl;
var colShader;
var texShader;

var xInvert = mat3.create();
var yInvert = mat3.create();

var asteroidVertexPostionBuffer;
var asteroidVertexIndexBuffer;
var asteroidVertexTextureCoordBuffer;

var missileVestexPositionBuffer;
var missileVestexColorBuffer;
var missileVertexIndexBuffer;

var backDropVertexPositionBuffer;
var backDropVertexIndexBuffer;
var backDropVertexTextureCoordBuffer;

var shipVertexPositonBuffer;
var shipVertexColorBuffer;
var shipVertexIndexBuffer;

var backdrop;
var asteroid;

var Ti;
var Tfire = 0;


function setMatrixUniforms(program)
{
	gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
}

Math.randomBounded = function (a,b)
{
	var d = Math.abs(a - b);

	if(b < a)
		return Math.random() * d + b
	else
		return Math.random() * d + a
}

Math.randomBoundedInt = function (a,b)
{
	return Math.round(Math.randomBounded(a,b));

}

/*************************************/
/*************************************/
/* GAME OBJECT DEFINITIONS
/*************************************/
/*************************************/

/*************************************/
/* MISSILE OBJECT
/*************************************/
function Missile(location, velocity)
{
	this.loc = vec3.clone(location);
	this.v = vec3.clone(velocity);
	this.o = null;
}


/*************************************/
/* SHIP OBJECT
/*************************************/
function Ship()
{
	this.loc = vec3.fromValues(0,0,0.1);
	this.v = vec3.fromValues(0,0,0);
	this.acc = 0;
	this.spin = 0;
	this.firing = false;

	this.draw = function()
	{
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, mvMatrix, this.loc);
		mat4.rotateZ(mvMatrix, mvMatrix, ship.spin);
		setMatrixUniforms(colShader);

		gl.bindBuffer(gl.ARRAY_BUFFER, shipVertexColorBuffer);
		gl.vertexAttribPointer(colShader.vertexColorAttribute, shipVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, shipVertexPositonBuffer);
		gl.vertexAttribPointer(colShader.vertexPositionAttribute, shipVertexPositonBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shipVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, shipVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}


/*************************************/
/* ASTEROID OBJECT
/*************************************/
function Asteroid(l, v, r, s)
{
	this.l = vec3.clone(l);
	this.v = vec3.clone(v);
	this.s = vec3.create();
	vec3.scale(this.s, vec3.fromValues(1,1,0), s);
	this.r = r;
	this.o = 0.0;
}


/*************************************/
/* ASTEROID FACTORY OBJECT
/*************************************/
function AsteroidFactory()
{
	this.asteroids = [];
	this.initvs = [vec3.fromValues(0,1.25,0),vec3.fromValues(1.25,0,0),vec3.fromValues(0,-1.25,0),vec3.fromValues(-1.25,0,0)];
	this.numL = 5;
	this.cNumL = 0;

	this.addAsteroid = function()
	{
		//randomize some initilization params
		var _s = Math.round(Math.random() * 3);
		var l = vec3.create();
		var v = vec3.create();
		vec3.add(l,this.initvs[_s],l);
		vec3.add(v,this.initvs[_s],v);

		l[_s%2] = (Math.random()*2-1) * 1;
		vec3.scale(v,v,-0.2*Math.random());
		v[_s%2] = (Math.random()*2-1) * 0.2;
		var r = (Math.random()*2-1) * 0.001;
		l[2]=0.1;

		vec3.scale(v,v,1/6);
		vec3.scale(l,l,1/6);

		this.asteroids.push(new Asteroid(l, v, r, 6));
		this.cNumL++;
	}

	for (var i=0; i < this.numL; i++ )
	{
		this.addAsteroid();
	}

	this.explode = function(el,rv,s)
	{
		if(s>1)
		{
			if(s==6)
				this.cNumL--;
			s=s/2;
			//vec3.scale(rv,rv,1/s);
			vec3.scale(el,el,1/s);
			var l1 = vec3.fromValues(el[0]+0.01*(Math.random()*2-1),el[1]+0.01*(Math.random()*2-1),0.1);
			var l2 = vec3.fromValues(el[0]+0.01*(Math.random()*2-1),el[1]+0.01*(Math.random()*2-1),0.1);
			//var l3 = vec3.fromValues(el[0],el[1]-0.005,0.1);
			var v1 = vec3.fromValues(rv[0]+0.25*(Math.random()*2-1),rv[1]+0.25*(Math.random()*2-1),0);
			var v2 = vec3.fromValues(rv[0]+0.25*(Math.random()*2-1),rv[1]+0.25*(Math.random()*2-1),0);
			//var v3 = vec3.fromValues(rv[0],rv[1]-0.005,0);
			var r1 = (Math.random() * 2 - 1) * 0.001;
			var r2 = (Math.random() * 2 - 1) * 0.001;
			vec3.scale(v1,v1,1/s);
			vec3.scale(v2,v2,1/s);
			//var r3 = (Math.random() * 2 - 1) * 0.001;
			this.asteroids.push(new Asteroid(l1, v1, r1, s));
			this.asteroids.push(new Asteroid(l2, v2, r2, s));
			//this.asteroids.push(new Asteroid(l3, v3, r2, s));
		}
		return;
	}

	this.checkColliding = function(mp)
	{
		var t;
		var rv;
		var s;
		var r = false;
		var i;
		for(i=0;i<this.asteroids.length && !r;i++)
		{
			t = vec3.create();
			var t2 = vec3.clone(mp);
			t2[2] = 0;
			s = this.asteroids[i].s[0];
			vec3.scale(t, this.asteroids[i].l, s);
			t[2] = 0;
			vec3.subtract(t2,t2,t);
			if(vec3.squaredLength(t2) < 0.005 * s)
			{
				rv = vec3.clone(this.asteroids[i].v);
				vec3.scale(rv, rv, s);
				r=true;
			}

		}
		if (r)
		{
			this.asteroids.splice(i-1,1);
			this.explode(t,rv,s);
		}
		return r;

	}
	this.updatePositions = function(d_T)
	{
		var deadAsteroids = [];

		for(var i=0;i<this.asteroids.length;i++)
		{
			var d = vec3.create();
			var n = vec3.create();
			vec3.scale(d, this.asteroids[i].v, d_T);
			vec3.add(this.asteroids[i].l,this.asteroids[i].l,d);
			this.asteroids[i].o += this.asteroids[i].r;

			if(Math.abs(this.asteroids[i].l[0]) * this.asteroids[i].s[0] >= 1.3)
				vec3.transformMat3(this.asteroids[i].l, this.asteroids[i].l, xInvert);

			if(Math.abs(this.asteroids[i].l[1]) * this.asteroids[i].s[1] >= 1.3)
				vec3.transformMat3(this.asteroids[i].l, this.asteroids[i].l, yInvert);
		}
		//clean up asteroids
		for(var i=0;i<deadAsteroids.length;i++)
			this.asteroids.splice(deadAsteroids[i],1);

		if (this.cNumL<this.numL)
			this.addAsteroid();

	}

	this.drawAsteroids = function()
	{
		for (var i=0;i<this.asteroids.length;i++)
		{
			mat4.identity(mvMatrix);
			mat4.scale(mvMatrix, mvMatrix, this.asteroids[i].s);
			mat4.translate(mvMatrix, mvMatrix, this.asteroids[i].l);
			mat4.rotateZ(mvMatrix, mvMatrix, this.asteroids[i].o);
			setMatrixUniforms(texShader);

			gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexPostionBuffer);
			gl.vertexAttribPointer(colShader.vertexPositionAttribute, asteroidVertexPostionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexTextureCoordBuffer);
			gl.vertexAttribPointer(texShader.vertexTextureAttribute, asteroidVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, asteroid);
			gl.uniform1i(texShader.samplerUniform, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroidVertexIndexBuffer);
			gl.drawElements(gl.TRIANGLES, asteroidVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		}
	}

}




function drawMissiles()
{
	for(var i=0;i<missiles.length;i++)
	{
		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, mvMatrix, missiles[i].loc);
		mat4.rotateZ(mvMatrix, mvMatrix, missiles[i].o);
		setMatrixUniforms(colShader);

		gl.bindBuffer(gl.ARRAY_BUFFER, missileVestexColorBuffer);
		gl.vertexAttribPointer(colShader.vertexColorAttribute, missileVestexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, missileVestexPositionBuffer);
		gl.vertexAttribPointer(colShader.vertexPositionAttribute, missileVestexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, missileVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, missileVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}

function drawBackDrop()
{
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, mvMatrix, [0,0,0.5]);

		setMatrixUniforms(texShader);
		gl.bindBuffer(gl.ARRAY_BUFFER, backDropVertexPositionBuffer);
		gl.vertexAttribPointer(texShader.vertexPositionAttribute, backDropVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, backDropVertexTextureCoordBuffer);
    	gl.vertexAttribPointer(texShader.vertexTextureAttribute, backDropVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, backdrop);
		gl.uniform1i(texShader.samplerUniform, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, backDropVertexIndexBuffer);
		gl.drawElements(gl.TRIANGLES, backDropVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


function drawScene()
{
	gl.viewport(-1, -1, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	gl.useProgram(texShader);
	drawBackDrop();
	factory.drawAsteroids();
	gl.useProgram(colShader);
	ship.draw();
	drawMissiles();
}

/*************************************/
/*************************************/
/* GAME FUNCTIONALITY FUNCTIONS
/*************************************/
/*************************************/

var factory;
var ship;
var missiles = [];


var currentlyPressedKeys = {};

function handleKeyDown(event)
{
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event)
{
	currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys()
{
	if (currentlyPressedKeys[32])
	{
		// Spacebar
		var t = new Date().getTime();
		if( t - Tfire > RATE_OF_FIRE)
		{
			var loc = vec3.fromValues(0,0,0.1);
			vec3.add(loc, vec3.fromValues(Math.cos(ship.spin + Math.PI/2) * 0.045, Math.sin(ship.spin  + Math.PI/2) * 0.045, 0), loc);
			vec3.add(loc, ship.loc, loc);
			missiles.push(new Missile(loc, ship.v));
			Tfire = t;
		}
	}
	if (!currentlyPressedKeys[32]) {
		// Spacebar
		ship.firing = false;
	}
	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
		// Left Arrow
		ship.spin -= 0.04;
	}
	if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
		// Right Arrow
		ship.spin += 0.04;
	}
	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
		// Up cursor key
		ship.acc = 2.5;
	}
	if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
		// Down cursor key
		ship.acc = -2.5;
	}
	if (!currentlyPressedKeys[38] && !currentlyPressedKeys[40] && !currentlyPressedKeys[87] && !currentlyPressedKeys[83]) {
		//No Accel
		ship.acc = 0;
	}
}

function animate()
{
	//timestamp
	var Tf = new Date().getTime();
	var d_T = (Tf - Ti)/2500;

	//Update the ship state
	var d_v = d_T * ship.acc;
	var d_vx = Math.cos(ship.spin+Math.PI/2) * d_v;
	var d_vy = Math.sin(ship.spin+Math.PI/2) * d_v;
	var vec = vec3.fromValues(d_vx, d_vy, 0);
	var dist = vec3.create();

	if ((ship.acc == 0 && vec3.squaredLength(ship.v) != 0) || vec3.squaredLength(ship.v) > 5.0)
		vec3.scale(ship.v, ship.v, 0.96);

	vec3.add(ship.v, ship.v, vec);
	vec3.scale(dist, ship.v, d_T)
	vec3.add(ship.loc, ship.loc, dist);

	if(Math.abs(ship.loc[0]) >= 1.04)
		vec3.transformMat3(ship.loc, ship.loc, xInvert);

	if(Math.abs(ship.loc[1]) >= 1.04)
		vec3.transformMat3(ship.loc, ship.loc, yInvert);

	//Deal with our missiles
	var deadMissiles = [];
	for(var i=0; i<missiles.length;i++)
	{
		if(missiles[i].o == null)
			missiles[i].o = ship.spin;
		if(vec3.squaredLength(missiles[i].v) < 6.0)
		{
			var nv = vec3.fromValues(Math.cos(missiles[i].o + Math.PI/2)*0.5*d_T*d_T*1800, Math.sin(missiles[i].o + Math.PI/2)*0.5*d_T*d_T*1800, 0.0);
			vec3.add(missiles[i].v, missiles[i].v, nv);
		}
		vec3.scale(dist, missiles[i].v, d_T);
		vec3.add(missiles[i].loc, missiles[i].loc, dist);

		//see if it blows anything up
		if (factory.checkColliding(missiles[i].loc))
			deadMissiles.push(i);

		//see if its gone off the screen
		if(Math.abs(missiles[i].loc[0]) > 1 || Math.abs(missiles[i].loc[1]) > 1)
			deadMissiles.push(i);

	}
	//clean up missiles
	for(var i=0;i<deadMissiles.length;i++)
		missiles.splice(deadMissiles[i],1);

	//Deal with the asteroids
	factory.updatePositions(d_T);

	Ti = Tf;
}

function tick()
{
	requestAnimFrame(tick);
	handleKeys();
	animate();
	drawScene();
}

function webGLStart()
{
	Ti = new Date().getTime();
	var canvas = document.getElementById("asteroid-canvas");
	initGL(canvas);
	backdrop = initTexture("./images/space.jpg");
	asteroid = initTexture("./images/atex.jpg");
	initShaders();
	initTransforms();
	initShipBuffers();
	initMissileBuffers();
	initAsteroidBuffers();
	initBackDropBuffers();
	ship = new Ship();
	factory = new AsteroidFactory();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	tick();
}
