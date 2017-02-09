var Component = function(o) {
    this.name = o.name || "component";
    this.priority = o.priority || 1000;
    this.extendObjects = o.extendObjects || [];
    this.processedObjectTypes = o.processedObjectTypes || [];
    if(o.processed) {
        this.processed = o.processed;
    }
    this.objects = [];
};

Component.prototype = {
    addObject: function(object){
        var len = this.processedObjectTypes.length;
        for(var i = 0; i < len; i++){
            if(object.is(this.processedObjectTypes[i])){
                this.objects.push(object);
                return true;
            }
        }
        return false;
    },
    processed: function(){}
};