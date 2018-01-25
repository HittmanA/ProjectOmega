class Vertex{
    constructor(x, y, z) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        this.z = parseFloat(z);
    }

    add(vertex){
        this.x += vertex.x;
        this.y += vertex.y;
        this.z += vertex.z;
    }
};

class Face{
    constructor(faces, color) {
        this.faces = faces;
        this.color = color;
    }
}

var Vertex2D = function(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
};

class Cube{
    constructor(center, side) {
        // Generate the vertices
        this.d = side / 2;
        this.center = center;

        this.genData();
    }

    moveTo(x, y, z) {
        this.center = new Vertex(x, y, z);
        this.vertices.forEach(elem => {
            elem.x += x;
            elem.y += y;
            elem.z += z;
        });
    }

    rotate(theta, phi) {
        this.vertices.forEach(elem => {
            this.rotateVertex(elem, theta, phi);
        });
    }

    rotateVertex(vertex, theta, phi) {
        // Rotation matrix coefficients
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        var cp = Math.cos(phi);
        var sp = Math.sin(phi);

        // Rotation
        var x = vertex.x - this.center.x;
        var y = vertex.y - this.center.y;
        var z = vertex.z - this.center.z;

        vertex.x = ct * x - st * cp * y + st * sp * z + this.center.x;
        vertex.y = st * x + ct * cp * y - ct * sp * z + this.center.y;
        vertex.z = sp * y + cp * z + this.center.z;
    }

    genData() {
        this.vertices = [
            new Vertex(this.center.x - this.d, this.center.y - this.d, this.center.z + this.d),
            new Vertex(this.center.x - this.d, this.center.y - this.d, this.center.z - this.d),
            new Vertex(this.center.x + this.d, this.center.y - this.d, this.center.z - this.d),
            new Vertex(this.center.x + this.d, this.center.y - this.d, this.center.z + this.d),
            new Vertex(this.center.x + this.d, this.center.y + this.d, this.center.z + this.d),
            new Vertex(this.center.x + this.d, this.center.y + this.d, this.center.z - this.d),
            new Vertex(this.center.x - this.d, this.center.y + this.d, this.center.z - this.d),
            new Vertex(this.center.x - this.d, this.center.y + this.d, this.center.z + this.d)
        ];

        // Generate the faces
        this.faces = [
            new Face([this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]], "rgba(255, 0, 0, 0.3)"),
            new Face([this.vertices[3], this.vertices[2], this.vertices[5], this.vertices[4]], "rgba(0, 255, 0, 0.3)"),
            new Face([this.vertices[4], this.vertices[5], this.vertices[6], this.vertices[7]], "rgba(0, 0, 255, 0.3)"),
            new Face([this.vertices[7], this.vertices[6], this.vertices[1], this.vertices[0]], "rgba(255, 255, 0, 0.3)"),
            new Face([this.vertices[7], this.vertices[0], this.vertices[3], this.vertices[4]], "rgba(0, 255, 255, 0.3)"),
            new Face([this.vertices[1], this.vertices[6], this.vertices[5], this.vertices[2]], "rgba(255, 0, 255, 0.3)"),
        ];
    }

};

function project(M) {
    // Distance between the camera and the plane
    var d = 1000;
    var r = d / (M.y + d);

    return new Vertex2D(r * M.x, r * M.z);
}

function render(objects, ctx, dx, dy) {
    // Clear the previous frame
    ctx.clearRect(0, 0, 2*dx, 2*dy);

    // For each object
    for (var i = 0, n_obj = objects.length; i < n_obj; ++i) {
        // For each face
        for (var j = 0, n_faces = objects[i].faces.length; j < n_faces; ++j) {
            // Current face
            var faceClass = objects[i].faces[j];
            var face = faceClass.faces;
            var color = faceClass.color;

            // Draw the first vertex
            var P = project(face[0]);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(P.x + dx, -P.y + dy);

            // Draw the other vertices
            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
                P = project(face[k]);
                ctx.lineTo(P.x + dx, -P.y + dy);
            }

            // Close the path and draw the face
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
}

(function() {
    // Fix the canvas width and height
    var canvas = document.getElementById('cnv');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var dx = canvas.width / 2;
    var dy = canvas.height / 2;

    // Objects style
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';

    // Create the cube
    var cube_center = new Vertex(0, 11*dy/10, 0);
    var cube = new Cube(cube_center, dy);
    var objects = [cube];

    // First render
    render(objects, ctx, dx, dy);

    // Events
    var mousedown = false;
    var mx = 0;
    var my = 0;

    canvas.addEventListener('mousedown', initMove);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stopMove);

    // Initialize the movement
    function initMove(evt) {
        clearTimeout(autorotate_timeout);
        mousedown = true;
        mx = evt.clientX;
        my = evt.clientY;
    }

    function move(evt) {
        if (mousedown) {
            var theta = (evt.clientX - mx) * Math.PI / 360;
            var phi = (evt.clientY - my) * Math.PI / 180;

            objects[0].rotate(theta, phi);

            mx = evt.clientX;
            my = evt.clientY;

            render(objects, ctx, dx, dy);
        }
    }

    function stopMove() {
        mousedown = false;
        autorotate_timeout = setTimeout(autorotate, 2000);
    }

    function autorotate() {
        objects[0].rotate(-Math.PI / 720, Math.PI / 720);
        objects[0].moveTo(objects[0].center.x + Math.sin(objects[0].center.x + 1), 0, 0);

        render(objects, ctx, dx, dy);

        autorotate_timeout = setTimeout(autorotate, 30);
    }
    autorotate_timeout = setTimeout(autorotate, 2000);
})();
