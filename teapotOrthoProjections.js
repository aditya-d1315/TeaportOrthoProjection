// Declaring gl globals..
var canvas;
var gl;
var program;

// Declaring vertex color list variable..
var vColorList;

// Declaring buffer variables..
var vBuffer;
var cBuffer;
var iBuffer;

// Declaring attribute variables for shaders..
var vPosition;
var vColor;

// Declaring composed matrix globals..
var M_comp;
var M_comp_loc;

// Declaring renderring globals..
var renderDelay;

// Creating initialization function..
window.onload = function init() {
    // Fetching canvas..
    canvas = document.getElementById("gl-canvas");

    // Initializing WebGL
    gl = initWebGL(canvas);
    if(!gl) {
        alert("WebGL not available.");
    }

    // Setting viewport..
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Creating shaders..
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Initializing buffers..
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    iBuffer = gl.createBuffer();

    // Setting up vertex buffer..
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(teapot_vertices), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Setting up color buffer..
    vColorList = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for(let i = 0; i < teapot_vertices.length; i ++) {
        vColorList.push([Math.random(), Math.random(), Math.random()]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vColorList), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Setting up index buffer..
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapot_indices), gl.STATIC_DRAW);

    // Fetching location of M_comp in shader..
    M_comp_loc = gl.getUniformLocation(program, "M_comp");

    // Initializing M_comp..
    M_comp = mat4();

    // Setting renderring delay..
    renderDelay = 10;

    // Calling render function..
    render();
};

// Creating renderring function..
function render() {
    // Renderring background color..
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}