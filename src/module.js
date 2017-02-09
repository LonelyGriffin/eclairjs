var Module = function() {};
Module.prototype = {
    name: "module",
    extendObjects: null,
    components: null,
    addComponent: function(component){
        this.components = this.components || [];
        this.components.push(component);
    },
    addExtendObjects: function(object){
        this.extendObjects = this.extendObjects || [];
        this.extendObjects.push(object);
    }
};
