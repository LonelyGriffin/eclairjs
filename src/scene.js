var Scene = function() {
    //Обьекты 'Живущие' в сцене.
    this._objects = [];
    //Компоненты обрабатывающие обьекты.
    this._components = [];
    //время завершения последнего шага симуляции
    this._time = null;
    // флаг указывающий запущена ли сцена
    this._isProcessed = false;
};

Scene.prototype = {
    addObject: function (object) {
        if(object){
            for(var i = 0; i < this._components.length; i++){
                this._components[i].addObject(object);
            }
            this._objects.push(object);
        }
    },
    addJoint: function(object){
        for(var i = 0; i < this._components.length; i++) {
            this._components[i].addObject(object);
        }
        this._objects.push(object);
    },
    addComponent: function(component) {
        var indexToInsert = 0;
        for (var i = 0; i < this._components.length; i++) {
            if (component.priority >= this._components[i].priority) {
                indexToInsert = i;
                break;
            }
        }
        this._components.splice(indexToInsert, 0, component);
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
                        that.nextStep(dt);
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
        var len = this._components.length;
        for(var i = 0; i < len; i++){
            this._components[i].processed(dt / 1000);
            this._components[i].currentCountProcessing = 1;
        }
        var needProccessing = true;
        while(needProccessing) {
            needProccessing = false;
            for(var i = 0; i < len; i++){
                if(this._components[i].currentCountProcessing < this._components[i].countProcessing){
                    this._components[i].processed(dt / 1000);
                    this._components[i].currentCountProcessing ]++;
                    needProccessing = true;
                }

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
        var i = Math.ceil(time / dt);
        for(i; i > 0; i--) {
            this.nextStep(dt);
        }
        return this._objects;
    }
};
