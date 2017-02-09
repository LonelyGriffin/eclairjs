Eclair.modules.Main.prototype.addExtendObjects(function() {

    var Object = function (o) {
        for(var i = 0; i < this.extendConstructors.length; i++) {
            this.extendConstructors[i].call(this, o);
        }
        Eclair.utils.mixin(this, o);
        this._uid = Eclair.utils.uid.create();
        this._prevState = {};
    };

    Object.prototype = {
        _type: "Object",
        _parentType: null,
        superclass: null,
        is: function (objectType) {
            if (typeof(objectType) === 'string') {
                //пробегаем по всей цепочке наследования и сравниваем обьект по типу
                var thisObject = this;
                while (thisObject.superclass) {
                    if (thisObject._type === objectType) {
                        return true;
                    }
                    thisObject = thisObject.superclass;
                }
            }
            return false;
        },
        extendConstructors: []
    };

    Object.prototype.constructor = Object;

    return Object;
});