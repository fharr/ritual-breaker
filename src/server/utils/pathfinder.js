exports.getPathLength = function (entity, target){    
    var x_dist = Math.abs(entity.position.x - target.position.x);
    var y_dist = Math.abs(entity.position.y - target.position.y);
    
    return x_dist + y_dist;
}
    
exports.moveTo = function (target, entity, world){    
    var dist_x = target.position.x - entity.position.x;
    var dist_y = target.position.y - entity.position.y;
    
    var newPosition = {x: entity.position.x, y: entity.position.y};
    
    if (dist_x < 1) {
        newPosition.x--; 
    } else if (dist_x > 1) {
        newPosition.x++;
    } else if (dist_y < 1) {
        newPosition.y--;
    } else if (dist_y > 1) {
        newPosition.y++;
    }
    
    world.map[entity.position.x, entity.position.y] = null;
        
    entity.position.x = newPosition.x;
    entity.position.y = newPosition.y;
    
    world.map[newPosition.x, newPosition.y] = entity;
}