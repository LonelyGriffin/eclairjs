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