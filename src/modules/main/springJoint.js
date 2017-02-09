Eclair.modules.Main.prototype.addComponent(new Eclair.Component({
    name: "SpringJoint",
    type: "solver",
    extendObjects: [function(){
        var SpringJoint = function(o){
            this.object1 = o.object1;
            this.object2 = o.object2;
            this.k = o.k || 1;
            if(!this.object1 || !this.object2) {
                throw "Eclair SpringJoint: object1 or object2 not found";
            }
            if(o.length) {
                this.constLength = o.length;
            } else {
                var dx = this.object1.positionX - this.object2.positionX;
                var dy = this.object1.positionY - this.object2.positionY;
                this.constLength = Math.sqrt(dx * dx + dy * dy);
            }
        };

        SpringJoint.prototype = {
            _type: "SpringJoint",
            _parentType: "Object"
        };
        return SpringJoint;
    }],
    processedObjectTypes: ["SpringJoint"],
    processed: function(){
        for(var i = 0; i < this.objects.length; i++){
            var joint = this.objects[i];

            var dx = joint.object2.positionX - joint.object1.positionX;
            var dy = joint.object2.positionY - joint.object1.positionY;
            var l = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(l - joint.constLength) > 0) {
                var dl = (l - joint.constLength);
                var cos = dx / l;
                var sin = dy / l;
                if(!joint.object1.static){
                    joint.object1.forceX += dl * cos * joint.k;
                    joint.object1.forceY += dl * sin * joint.k;
                }
                if(!joint.object2.static){
                    joint.object2.forceX -= dl * cos * joint.k;
                    joint.object2.forceY -= dl * sin * joint.k;
                }
            }
        }
    }
}));
