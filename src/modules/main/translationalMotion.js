Eclair.modules.Main.prototype.addComponent(new Eclair.Component({
    name: "TranslationMotion",
    type: "standard",
    priority: 100000,
    extendObjects: [{
            _type: "Point",
            mass: 1,
            forceX: 0,
            forceY: 0,
            startForceX: 0,
            startForceY: 0,
            static: false,
            moveTo: function(x, y) {
                this.positionX = x;
                this.positionY = y;
            },
            extendConstructors: function(o) {
                //console.log(1);
            }
        },
        {
            _type: "Polygon",
            moveTo: function(x, y) {
                this.positionX = x;
                this.positionY = y;
                for(var i = 0; i < this.vertices.length; i++) {
                    this.vertices[i].x = this.normalizeVertices[i].x + x;
                    this.vertices[i].y = this.normalizeVertices[i].y + y;
                }
            }
        }
    ],
    processedObjectTypes: ["Point"],
    processed: function(dt){
        for(var i = 0; i < this.objects.length; i++){
            var point = this.objects[i];
            if(!point.static){
                var forceX = point.forceX + point.startForceX;
                var forceY = point.forceY + point.startForceY;


                var dtdt = dt * dt,
                    newx = 2 * point.positionX - point._prevState.positionX + forceX * dtdt / point.mass,
                    newy = 2 * point.positionY - point._prevState.positionY + forceY * dtdt / point.mass;
                point._prevState.positionX = point.positionX;
                point._prevState.positionY = point.positionY;
                point.moveTo(newx, newy);


                point.startForceY = 0;
                point.startForceX = 0;
            }
        }
    }
}));
