exports.getWorldDto = function(world) {
    var dtos = new Array();
       
    // dtoType: "witch"
    dtos.push(getDto(world.witch, "witch"));
    
    // dtoType: "enemy" == enemy
    for(var i = 0; i < world.enemies.length; i++) {
        dtos.push(getDto(world.enemies[i], "enemy"));
    }
    
    // dtoType: "harvestable"
    for(var i = 0; i < world.harvestables.length; i++) {
        dtos.push(getDto(world.harvestables[i], "harvestable"));
    }
    
    // dtoType: "exit"
    for(var i = 0; i < world.exits.length; i++) {
        dtos.push(getDto(world.exits[i], "exit"));
    }
    
    return dtos;
}

var getDto = function(entity, type) {
    var dto = {};
    
    dto.id = entity.id;
    dto.x = entity.position.x;
    dto.y = entity.position.y;
    dto.type = type;

    return dto;
}

exports.getDto = getDto;