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

