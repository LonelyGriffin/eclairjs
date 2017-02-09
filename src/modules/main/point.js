Eclair.modules.Main.prototype.addExtendObjects(function() {

    var Point = function (o) {
        Point.prototype.superclass.constructor.call(this, o);
        this.positionX = o.positionX || 0;
        this.positionY = o.positionY || 0;
        this._prevState.positionX = this.positionX;
        this._prevState.positionY = this.positionY;
    };
    Point.prototype = {
        _type: "Point",
        _parentType: "Object"
    };

    return Point;
});