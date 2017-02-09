Eclair.modules.Main.prototype.addComponent(new Eclair.Component({
    name: "RodJoint",
    type: "solver",
    extendObjects: [function(){
        var RodJoint = function(o){
            this.object1 = o.object1;
            this.object2 = o.object2;
            if(!this.object1 || !this.object2) {
                throw "Eclair RodJoint: object1 or object2 not found";
            }
            var dx = this.object1.positionX - this.object2.positionX;
            var dy = this.object1.positionY - this.object2.positionY;
            this.constLength = Math.sqrt(dx * dx + dy * dy);
            this._k = 0.5;
            if(this.object1.static || this.object2.static) {
                this._k = 1;
            }
        };

        RodJoint.prototype = {
            _type: "RodJoint",
            _parentType: "Object"
        };
        return RodJoint;
    }],
    processedObjectTypes: ["RodJoint"],
    processed: function(dt){
        for(var i = 0; i < this.objects.length; i++){
            var joint = this.objects[i];

            var dx = joint.object2.positionX - joint.object1.positionX;
            var dy = joint.object2.positionY - joint.object1.positionY;
            var l = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(l - joint.constLength) > 0) {
                var dl = (l - joint.constLength) * joint._k;
                var cos = dx / l;
                var sin = dy / l;
                if(!joint.object1.static){
                    joint.object1.positionX += dl * cos;
                    joint.object1.positionY += dl * sin;
                }
                if(!joint.object2.static){
                    joint.object2.positionX -= dl * cos;
                    joint.object2.positionY -= dl * sin;
                }
            }
        }
    }
}));
