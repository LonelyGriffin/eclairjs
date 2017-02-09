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

    this.addModule(mainModule || new Eclair.modules.Main());

    for(i = 0; i < len; i++){
        if(modules[i].name !== "main") {
            this.addModule(modules[i]);
        }
    }
};
Eclair.prototype = {
    addModule: function(module) {
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
Eclair.modules = {};





Eclair.utils = {
    uid: (function(){
        var maxUID = -1;
        var freeUID = [];
        return {
            create: function(){
                if(freeUID.length === 0) {
                    maxUID++;
                    return maxUID;
                } else {
                    return freeUID.pop();
                }
            },
            delete: function(uid){
                //определяем существует ли такой uid
                var isFreeUid = (uid > maxUID);
                for(var i in freeUID){
                    if(freeUID[i] === uid){
                        isFreeUid = true;
                    }
                }
                //если существует то удаляем
                if(!isFreeUid){
                    if(uid === maxUID) {
                        maxUID--;
                    } else {
                        freeUID.push(uid);
                    }
                }
            }
        };
    })(),
    mixin: function(dst, src){
        for(var key in src) {
            if(src.hasOwnProperty(key)) {
                dst[key] = src[key];
            }
        }
    },

    inherit: function(parent, child) {
        child = child || function(){};
        var F = function() {},
            oldChildPrototype = child.prototype || {};
        F.prototype = parent.prototype;
        child.prototype = new F();
        Eclair.utils.mixin(child.prototype, oldChildPrototype);
        child.prototype.constructor = child;
        child.prototype.superclass = parent.prototype;
        return child;
    }
};
Eclair.Component = function(o) {
    this.name = o.name || "component";
    this.type = o.type || "standard";
    this.priority = o.priority || 1000;
    this.extendObjects = o.extendObjects || [];
    this.processedObjectTypes = o.processedObjectTypes || [];
    if(o.processed) {
        this.processed = o.processed;
    }
    this.objects = [];
};

Eclair.Component.prototype = {
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
Eclair.Debugger = function(canvasID, scene) {
    this.canvas = document.getElementById(canvasID);
    this.context = this.canvas.getContext('2d');
    this.scene = scene;
};
Eclair.Debugger.prototype = {
    scale: 20,
    start: function(dt){
        this.scene.start(this.drawObjects, dt, this);
    },
    stop: function(){
        this.scene.stop();
    },
    drawObjects: function(objects){//console.log(objects);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(var i = 0; i < objects.length; i++){
            if(this[objects[i]._type]){
                this[objects[i]._type](objects[i]);
            }
        }
    },
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
};


Eclair.Module = function(components) {
    for(var key in components){
        /////////////
    }
};
Eclair.Module.prototype = {
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

Eclair.Scene = function() {
    //Обьекты 'Живущие' в сцене.
    this._objects = [];
    //Компоненты обрабатывающие обьекты.
    this._standardComponents = [];
    this._solverComponents = [];
    //время завершения последнего шага симуляции
    this._time = null;
    // флаг указывающий запущена ли сцена
    this._isProcessed = false;
};

Eclair.Scene.prototype = {
    addObject: function (object) {
        if(object){
            for(var i = 0; i < this._standardComponents.length; i++){
                this._standardComponents[i].addObject(object);
            }
            this._objects.push(object);
        }
    },
    addJoint: function(object){
        for(var i = 0; i < this._solverComponents.length; i++) {
            this._solverComponents[i].addObject(object);
        }
        this._objects.push(object);
    },
    addComponent: function(component) {
        var indexToInsert = 0;
        if(component.type === "standard") {
            for (var i = 0; i < this._standardComponents.length; i++) {
                if (component.priority >= this._standardComponents[i].priority) {
                    indexToInsert = i;
                    break;
                }
            }
            this._standardComponents.splice(indexToInsert, 0, component);
        }
        if(component.type === "solver") {
            this._solverComponents.push(component);
        }
    },
    /**
     * Запуск сцены
     * @param  {Function} callback функция вызываемая после каждого шага симуляции.
     * В нее передается текущие состояние сцены.
     * @param {number} dt Время шага симуляции.
     * @param {[object]} callbackScope контекст вызова кэлбека.
     */
    start: function (callback, dt, callbackScope) {
        this._isProcessed = true;
        var that = this,
            timer = setInterval(function(){
                if(that._isProcessed){
                    if(!that._time){
                        that._time = new Date();
                    } else {
                        var newTime = new Date();
                        that.nextStep(dt/*newTime.getTime() - that._time.getTime()*/);
                        that._time = newTime;
                    }
                    callback.call(callbackScope, that._objects);
                } else {
                    clearInterval(timer);
                }
            }, dt);
    },
    /**
     * Останавливает симуляцию.
     */
    stop: function () {
        this._isProcessed = false;
    },
    /**
     * делает шаг симуляции с интервалом dt и возвращает новое состояние сцены.
     * @param  {number} dt интервал времени шага симуляции.
     * @return {Object}     Обьект с данными о состоянии сцены.
     */
    nextStep: function (dt) {
        var len = this._standardComponents.length;
        for(var i = 0; i < len; i++){
            this._standardComponents[i].processed(dt / 1000);
        }
        for(var j = 0; j < 30; j++) {
            for(i = 0; i < this._solverComponents.length; i++){
                this._solverComponents[i].processed(dt / 1000);
            }
        }
        return this._objects;
    },
    /**
     * Возвращает состояние сцены через время time, с времнем шага симуляции dt
     * @param  {number} time время симуляции.
     * @param  {number} dt   время шага симуляции.
     * @return {Object}      Обьект с данными о состоянии сцены.
     */
    nextState: function(time, dt) {

    }
};

Eclair.modules.Main = function(o){
    this.superclass.constructor.call(this, o);
};
Eclair.modules.Main.prototype = {
    name: "Main"
};
Eclair.utils.inherit(Eclair.Module, Eclair.modules.Main);

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

Eclair.modules.Main.prototype.addComponent(new Eclair.Component({
    name: "SpringJoint",
    type: "standard",
    extendObjects: [{
        _type: "Polygon",
        getNormals: function() {
            var normals = [],
                len = this.vertices.length,
                prevVertex = this.vertices[len - 1];
            for(var i = 0; i < len; i++) {
                var dx = prevVertex.x - this.vertices[i].x,
                    dy = this.vertices[i].y -  prevVertex.y,
                    d = Math.sqrt(dx * dx + dy * dy);
                normals.push({
                    x: dy / d,
                    y: dx / d
                });
                prevVertex = this.vertices[i];
            }
            return normals;
        },
        getProjection: function(vector) {
            var len = this.vertices.length,
                projections = [];
            function getShadow(array, field){
                var min = Number.MAX_VALUE,
                    max = -Number.MAX_VALUE,
                    shadow = [{}, {}],
                    len = array.length;
                for(var i = 0; i < len; i++) {
                    if(array[i][field] < min) {
                        shadow[0] = array[i];
                        min = array[i][field];
                    }
                    if(array[i][field] > max) {
                        shadow[1] = array[i];
                        max = array[i][field];
                    }
                }
                return shadow;
            }

            for(var i = 0; i < len; i++) {
                var dp = this.vertices[i].x * vector.x + this.vertices[i].y * vector.y;

                projections.push({
                    x: dp * vector.x,
                    y: dp * vector.y
                });
            }

            var projection = getShadow(projections, 'x');
            if(projection[0].x == projection[1].x) {
                projection = getShadow(projections, 'y');
            }
            return projection;
        }
    }],
    processedObjectTypes: ["Polygon"],
    processed: function(){
        for(var i = 0; i < this.objects.length - 1; i++){
            for(var j = i + 1; j < this.objects.length; j++) {
                var polygon1 = this.objects[i],
                    polygon2 = this.objects[j],
                    normals = polygon1.getNormals().concat(polygon2.getNormals()),
                    hasOverlap = true,
                    minOverlap = Number.MAX_VALUE,
                    minProjections, minField;

                for(var k = 0; k < normals.length; k++) {
                    var projection1 = polygon1.getProjection(normals[k]),
                        projection2 = polygon2.getProjection(normals[k]),
                        overlap = false;
                    //calc overlap
                    var field = normals[k].x === 0 ? 'y' : 'x';
                    if(projection1[0][field] <= projection2[0][field]) {
                        if(projection1[1][field] >= projection2[0][field]) {
                            overlap = projection1[1][field] - projection2[0][field];
                        }
                    }
                    if(projection2[0][field] <= projection1[0][field]) {
                        if(projection2[1][field] >= projection1[0][field]) {
                            overlap = projection2[1][field] - projection1[0][field];
                        }
                    }
                    ////
                    if(overlap) {
                        if(overlap < minOverlap) {
                            minOverlap = overlap;
                            minProjections = [projection1, projection2];
                            minField = field;
                        }
                    } else {
                        hasOverlap = false;
                        break;
                    }
                }
                if(hasOverlap) {
                    //console.log(minProjections);
                    //console.log("hasOverlap");
                    //var massK = polygon1.mass / polygon2.mass;
                    var dx, dy;
                    if(minProjections[0][0].x < minProjections[1][0].x) {
                        dx = minProjections[0][1].x - minProjections[1][0].x;

                    } else {
                        dx = minProjections[1][0].x - minProjections[0][1].x;
                    }
                    if(minProjections[0][0].y < minProjections[1][0].y) {
                        dy = minProjections[0][1].y - minProjections[1][0].y;

                    } else {
                        dy = minProjections[1][0].y - minProjections[0][1].y;
                    }
                    polygon1.positionY -= dy / 2;
                    polygon2.positionY += dy / 2;
                    polygon1.positionX -= dx / 2;
                    polygon2.positionX += dx / 2;
                }
            }
        }
    }
}));

