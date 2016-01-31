"use strict";

class Action {
    constructor(entityId, action, x, y) {
        this.entityId = entityId;
        this.action = action;
        this.x = x;
        this.y = y;
    }
}

exports.Action = Action;