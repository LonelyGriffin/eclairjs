var Debugger = function(canvasID, scene) {
    this.canvas = document.getElementById(canvasID);
    this.context = this.canvas.getContext('2d');
    this.scene = scene;
};
Debugger.prototype = {
    scale: 20,
    start: function(dt){
        this.scene.start(this.drawObjects, dt, this);
    },
    stop: function(){
        this.scene.stop();
    },
    nextState: function(dt) {
        this.drawObjects(this.scene.nextState(dt));
    },
    drawObjects: function(objects){//console.log(objects);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(var i = 0; i < objects.length; i++){
            if(this[objects[i]._type]){
                this.renders[objects[i]._type](objects[i]);
            }
        }
    },
    addRender: function(render, name) {
        this.renders[name] = render;
    },
    removeRender: function(render) {
        if(typeof render === "string") {
            delete this.renders[render];

        } else {
            for(var i in this.renders) {
                if(this.renders[i] === render) {
                    delete this.renders[i];
                }
            }
        }
    }
    renders: {
        Point: function(point){
            this.context.beginPath();
            this.context.arc(point.positionX * this.scale, point.positionY * this.scale, 2, 0, 2 * Math.PI, false);
            this.context.lineWidth = 1;
            this.context.stroke();
        },
        Polygon: function(polygon){
            var len = polygon.vertices.length;
            if(len > 0){
                this.context.beginPath();
                this.context.moveTo(polygon.vertices[len - 1].x  * this.scale, polygon.vertices[len - 1].y  * this.scale);
                for(var i = 0; i < len; i++){
                    this.context.lineTo(polygon.vertices[i].x  * this.scale, polygon.vertices[i].y  * this.scale);
                }
                this.context.lineWidth = 1;
                this.context.stroke();
            }
        },
        RodJoint: function(rodJoint) {
            this.context.beginPath();
            this.context.moveTo(rodJoint.object1.positionX  * this.scale, rodJoint.object1.positionY  * this.scale);
            this.context.lineTo(rodJoint.object2.positionX  * this.scale, rodJoint.object2.positionY  * this.scale);
            this.context.lineWidth = 1;
            this.context.stroke();
        }
    }
};

module.exports = Debugger;