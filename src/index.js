var Eclair = function(modules){
    modules = modules || [];

    var len = modules.length,
        mainModule = null;

    this.scene = new Eclair.Scene();

    for(var i = 0; i < len; i++){
        if(modules[i].name === "main") {
            mainModule = modules[i];
        }
    }

    this.setModule(mainModule || new Eclair.MainModule());

    for(i = 0; i < len; i++){
        if(modules[i].name !== "main") {
            this.setModule(modules[i]);
        }
    }
};
Eclair.Module = require("./module");
Eclair.Component = require("./component");
Eclair.Debugger = require("./debugger");
Eclair.Scene = require("./scene");
Eclair.MainModule = require("./mоdules/main");
Eclair.prototype = {
    setModule: function(module) {
        var that = this,
            newConstructors = [];

        function addObject(object){
            if(typeof object === "function") {
                var constructor = object();
                that[constructor.prototype._type] = constructor;
                newConstructors.push(constructor);
            } else {
                if(object.extendConstructors) {
                    if(!that[object._type].prototype.extendConstructors) {
                        that[object._type].prototype.extendConstructors = [];
                    }
                    that[object._type].prototype.extendConstructors.push(object.extendConstructors);
                    delete object.extendConstructors;
                }
                Eclair.utils.mixin(that[object._type].prototype, object);
            }
        }

        for(var i = 0; i < module.extendObjects.length; i++) {
            addObject(module.extendObjects[i]);
        }

        var components = module.components;

        for(var j = 0; j < components.length; j++) {
            that.scene.addComponent(components[j]);
            for(var k = 0; k < components[j].extendObjects.length; k++) {
                addObject(components[j].extendObjects[k]);
            }
        }

        for(i = 0; i < newConstructors.length; i++) {
            if(newConstructors[i].prototype._parentType) {
                var child = that[newConstructors[i].prototype._type];
                var parent = that[child.prototype._parentType] || that.Object;
                Eclair.utils.inherit(parent, child);
            }
        }
    }
};

module.exports = Eclair;





