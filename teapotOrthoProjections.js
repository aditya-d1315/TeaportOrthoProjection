// Declaring gl globals..
var canvas;
var gl;
var program;

// Declaring button globals..
var xPositiveButton;
var xNegativeButton;
var yPositiveButton;
var yNegativeButton;
var zPositiveButton;
var zNegativeButton;
var ULButton;
var URButton;

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
var M_ortho;
var M_camera;

// Declaring renderring globals..
var renderDelay;

// Creating initialization function..
window.onload = function init() {
    // Fetching canvas..
    canvas = document.getElementById("gl-canvas");

    // Fetching buttons..
    xPositiveButton = document.getElementById("xPositive");
    xNegativeButton = document.getElementById("xNegative");
    yPositiveButton = document.getElementById("yPositive");
    yNegativeButton = document.getElementById("yNegative");
    zPositiveButton = document.getElementById("zPositive");
    zNegativeButton = document.getElementById("zNegative");
    ULButton = document.getElementById("UL");
    URButton = document.getElementById("UR");

    // Preparing +X camera transform..
    xPositiveButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([1.0, 0.0, 0.0], [1.0, 1.0, 0.0]);
    });

    // Preparing -X camera transform..
    xNegativeButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([-1.0, 0.0, 0.0], [-1.0, 1.0, 0.0]);
    });

    // Preparing +Y camera transform..
    yPositiveButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([0.0, 1.0, 0.0], [0.0, 1.0, -1.0]);
    });

    // Preparing -Y camera transform..
    yNegativeButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([0.0, -1.0, 0.0], [0.0, -1.0, -1.0]);
    });

    // Preparing +Z camera transform..
    zPositiveButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([0.0, 0.0, 1.0], [0.0, 1.0, 1.0]);
    });

    // Preparing -Z camera transform..
    zNegativeButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([0.0, 0.0, -1.0], [0.0, 1.0, -1.0]);
    });

    // Perparing UL camera transform..
    ULButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([-1.0, 1.0, 1.0], [-1.0, 2.0, 1.0]);
    });

    // Preparing UR camera transform..
    URButton.addEventListener("click", () => {
        M_camera = cameraTransform4x4([1.0, 1.0, 1.0], [1.0, 2.0, 1.0]);
    });

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

    // Initializing M_ortho..
    M_ortho = normalizeTransform4x4(-100, 100, -100, 100, -100, 100);

    // Initializing M_camera..
    M_camera = mat4();

    // Enabling depth test for 3D viewing..
    gl.enable(gl.DEPTH_TEST);

    // Setting renderring delay..
    renderDelay = 10;

    // Calling render function..
    render();
};

// Creating normalizing transform function..
function normalizeTransform4x4(left, right, bottom, top, near, far) {
    // Initializing 4x4 matrix..
    let normalize = mat4();

    // Populating 4x4 matrix..
    normalize[0][0] = 2.0 / (right - left);
    normalize[0][3] = -((right + left) / (right - left));
    normalize[1][1] = 2.0 / (top - bottom);
    normalize[1][3] = -((top + bottom) / (top - bottom));
    normalize[2][2] = -2.0 / (far - near);
    normalize[2][3] = -((far + near) / (far - near));

    // Returning normalizing matrix..
    return normalize;
}

// Creating camera transform function..
function cameraTransform4x4(cameraPosition, upPoint) {
    // Initializing 4x4 matrix..
    let camera = mat4();

    // Calculating look at vector prime..
    let LAT_prime = [-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]];

    // Calculating up vector prime..
    let UP_prime = [upPoint[0] - cameraPosition[0], upPoint[1] - cameraPosition[1], upPoint[2] - cameraPosition[2]];

    // Calculating U vector..
    let u = normalize(cross_product(LAT_prime, UP_prime), false);

    // Calculating V vector..
    let v = normalize(cross_product(u, LAT_prime), false);

    // Calculating N vector..
    let n = normalize(negate(LAT_prime), false);

    // Populating 4x4 matrix row one..
    camera[0][0] = u[0];
    camera[0][1] = u[1];
    camera[0][2] = u[2];
    camera[0][3] = 0;

    // Populating 4x4 matrix row two..
    camera[1][0] = v[0];
    camera[1][1] = v[1];
    camera[1][2] = v[2];
    camera[1][3] = 0;

    // Populating 4x4 matrix row three..
    camera[2][0] = n[0];
    camera[2][1] = n[1];
    camera[2][2] = n[2];
    camera[2][3] = 0;

    // Populating 4x4 matrix row four..
    camera[3][0] = 0;
    camera[3][1] = 0;
    camera[3][2] = 0;
    camera[3][3] = 1;

    // Returning camera transform matrix..
    return camera;
}

// Creating renderring function..
function render() {
    // Renderring background color..
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Setting composed matrix..
    M_comp = matMult(M_ortho, M_camera);

    // Sending composed matrix to shader..
    gl.uniformMatrix4fv(M_comp_loc, false, flatten(M_comp));

    // Renderring teapot..
    gl.drawElements(gl.TRIANGLES, teapot_indices.length, gl.UNSIGNED_SHORT, 0);

    // Refreshing render loop..
    setTimeout(function() {
        requestAnimFrame(render);
    }, renderDelay);
}