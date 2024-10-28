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

// Declaring bounding box globals..
var xMin;
var xMax;
var yMin;
var yMax;
var zMin;
var zMax;

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

    /* Finding teapot's bounding box x, y, and z values */
    // Finding min and max x-values..
    let xBoundingBoxValues = findMinMax(0);
    xMin = xBoundingBoxValues[0];
    xMax = xBoundingBoxValues[1];

    // Finding min and max y-values..
    let yBoundingBoxValues = findMinMax(1);
    yMin = yBoundingBoxValues[0];
    yMax = yBoundingBoxValues[1];

    // Finding min and max z-values..
    let zBoundingBoxValues = findMinMax(2);
    zMin = zBoundingBoxValues[0];
    zMax = zBoundingBoxValues[1];

    // Fetching location of M_comp in shader..
    M_comp_loc = gl.getUniformLocation(program, "M_comp");

    // Initializing M_comp..
    M_comp = mat4();

    // Enabling depth test for 3D viewing..
    gl.enable(gl.DEPTH_TEST);

    // Setting renderring delay..
    renderDelay = 10;

    // Calling render function..
    render();
};

// Creating bounding box min/max helper function..
function findMinMax(dim) {
    // Initializing temp variables..
    let min = Infinity;
    let max = -Infinity;

    // Finding min and max values..
    for(let i = 0; i < teapot_vertices.length; i ++) {
        if(teapot_vertices[i][dim] < min) {
            min = teapot_vertices[i][dim];
        }
        if(teapot_vertices[i][dim] > max) {
            max = teapot_vertices[i][dim];
        }
    }

    // Returning minimum and maximum values..
    return [min, max];
}

// Creating renderring function..
function render() {
    // Renderring background color..
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Test section for renderring teapot properly*/
    // Renderring teapot..
    M_comp = scale4x4(1/150, 1/150, 1/150);
    gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));
    gl.drawElements(gl.TRIANGLES, teapot_vertices.length, gl.UNSIGNED_SHORT, 0);

    // Refreshing render loop..
    setTimeout(function() {
        requestAnimFrame(render);
    }, renderDelay
    );
}