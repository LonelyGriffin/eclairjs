Eclair.modules.Main.prototype.addExtendObjects(function() {

    var Polygon = function (o) {
        Polygon.prototype.superclass.constructor.call(this, o);
        this.normalizeVertices = o.vertices || [];
        this.vertices = [];
        for(var i = 0; i < this.normalizeVertices.length; i++) {
            this.vertices.push({
                x: this.normalizeVertices[i].x + this.positionX,
                y: this.normalizeVertices[i].y + this.positionY
            });
        }
    };
    Polygon.prototype = {
        _type: "Polygon",
        _parentType: "Point"
    };

    return Polygon;
});