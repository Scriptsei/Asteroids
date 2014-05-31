/*************************************/
/* WEBGL SETUP FUNCTIONS
/*************************************/
var mvMatrix = mat4.create();	//modelview matrix, controls global transform
var pMatrix = mat4.create();	//perspective matrix, control view port

function initTransforms()
{
	xInvert[0] = -1;
	xInvert[4] = 0;
	xInvert[8] = 0;

	yInvert[0] = 0;
	yInvert[4] = -1;
	yInvert[8] = 0;
}


function initGL(canvas)
{
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}


function initTexture(tex)
{
	var tex_o = gl.createTexture();
	tex_o.img = new Image();
	tex_o.img.onload = function() {handleLoadedTexture(tex_o);};
	tex_o.img.crossOrigin = ''; // no credentials flag. Same as img.crossOrigin='anonymous'
	tex_o.img.src = tex;
	return tex_o;
}

function handleLoadedTexture(texture)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function getShader(gl, id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


function initShaders()
{
	//solid color shader for everything but the backdrop
	colShader = gl.createProgram();
	gl.attachShader(colShader, getShader(gl, "shader-fs"));
	gl.attachShader(colShader, getShader(gl, "shader-vs"));
	gl.linkProgram(colShader);

	if (!gl.getProgramParameter(colShader, gl.LINK_STATUS))
		alert("Could not initialise shaders");

	colShader.vertexPositionAttribute = gl.getAttribLocation(colShader, "aVertexPosition");
	gl.enableVertexAttribArray(colShader.vertexPositionAttribute);

	colShader.vertexColorAttribute = gl.getAttribLocation(colShader, "aVertexColor");
	gl.enableVertexAttribArray(colShader.vertexColorAttribute);

	colShader.mvMatrixUniform = gl.getUniformLocation(colShader, "uMVMatrix");
	colShader.pMatrixUniform = gl.getUniformLocation(colShader, "uPMatrix");

	//load texture shader
	texShader = gl.createProgram();
	gl.attachShader(texShader, getShader(gl, "shader-tfs"));
	gl.attachShader(texShader, getShader(gl, "shader-tvs"));
	gl.linkProgram(texShader);

	if (!gl.getProgramParameter(texShader, gl.LINK_STATUS))
		alert("Could not initialise shaders");

	texShader.vertexPositionAttribute = gl.getAttribLocation(texShader, "aVertexPosition");
	gl.enableVertexAttribArray(texShader.vertexPositionAttribute);

	texShader.vertexTextureAttribute = gl.getAttribLocation(texShader, "aTextureCoord");
	gl.enableVertexAttribArray(texShader.vertexTextureAttribute);

	texShader.mvMatrixUniform = gl.getUniformLocation(texShader, "uMVMatrix");
	texShader.pMatrixUniform = gl.getUniformLocation(texShader, "uPMatrix");
	texShader.samplerUniform = gl.getUniformLocation(texShader, "uSampler");

}





function initBackDropBuffers()
{
	backDropVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, backDropVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BACKDROP_VERTS), gl.STATIC_DRAW);
	backDropVertexPositionBuffer.itemSize = 3;
	backDropVertexPositionBuffer.numItems = BACKDROP_VERTS.length/3;

    backDropVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, backDropVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BACKDROP_TRIS), gl.STATIC_DRAW);
    backDropVertexTextureCoordBuffer.itemSize = 2;
    backDropVertexTextureCoordBuffer.numItems = BACKDROP_TRIS.length/2;

	backDropVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, backDropVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(BACKDROP_UVS), gl.STATIC_DRAW);
	backDropVertexIndexBuffer.itemSize = 1;
	backDropVertexIndexBuffer.numItems = BACKDROP_UVS.length;
}



function initMissileBuffers()
{
	missileVestexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, missileVestexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(MISSILE_VERTS), gl.STATIC_DRAW);
	missileVestexPositionBuffer.itemSize = 3;
	missileVestexPositionBuffer.numItems = MISSILE_VERTS.length/3;

	missileVestexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, missileVestexColorBuffer);
	var vertexColor = [];
	for (var i=0;i<missileVestexPositionBuffer.numItems;i++)
	{
		vertexColor.push(1.0); //r
		vertexColor.push(0.0); //b
		vertexColor.push(0.0); //g
		vertexColor.push(1.0); //a
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
	missileVestexColorBuffer.itemSize = 4;
	missileVestexColorBuffer.numItems = missileVestexPositionBuffer.numItems;

	missileVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, missileVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(MISSILE_TRIS), gl.STATIC_DRAW);
	missileVertexIndexBuffer.itemSize = 1;
	missileVertexIndexBuffer.numItems = MISSILE_TRIS.length;
}



function initAsteroidBuffers()
{
	asteroidVertexPostionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexPostionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ASTEROID_VERTS), gl.STATIC_DRAW);
	asteroidVertexPostionBuffer.itemSize = 3;
	asteroidVertexPostionBuffer.numItems = ASTEROID_VERTS.length/asteroidVertexPostionBuffer.itemSize;

    asteroidVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, asteroidVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ASTEROID_UVS), gl.STATIC_DRAW);
    asteroidVertexTextureCoordBuffer.itemSize = 2;
    asteroidVertexTextureCoordBuffer.numItems = ASTEROID_UVS.length/2;

	asteroidVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroidVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ASTEROID_TRIS), gl.STATIC_DRAW);
	asteroidVertexIndexBuffer.itemSize = 1;
	asteroidVertexIndexBuffer.numItems = ASTEROID_TRIS.length;

}

function initShipBuffers()
{
	shipVertexPositonBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shipVertexPositonBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SHIP_VERTS), gl.STATIC_DRAW);
	shipVertexPositonBuffer.itemSize = 3;
	shipVertexPositonBuffer.numItems = SHIP_VERTS.length/3;

	shipVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, shipVertexColorBuffer);
	var vertexColor = [];

	for (var i=0;i<shipVertexPositonBuffer.numItems;i++)
	{
		vertexColor.push(1.0); //r
		vertexColor.push(1.0); //b
		vertexColor.push(1.0); //g
		vertexColor.push(1.0); //a
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
	shipVertexColorBuffer.itemSize = 4;
	shipVertexColorBuffer.numItems = shipVertexPositonBuffer.numItems;

	shipVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shipVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(SHIP_TRIS), gl.STATIC_DRAW);
	shipVertexIndexBuffer.itemSize = 1;
	shipVertexIndexBuffer.numItems = SHIP_TRIS.length;
}