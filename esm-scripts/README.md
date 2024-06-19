### Updates legacy PlayCanvas scripts to the newer ESM Scripts format

This codemod transforms legacy PlayCanvas Scripts into their newer modern equivalents. You can open this codemod and run it over your existing scripts in vscode using the link to the side.

The codemod fully supports all syntax transformations apart from 'json' type attributes..

Running the codemod over the following code...

```javascript
var Rotator = pc.createScript('rotator');

Rotator.attributes.add('speed', { type: 'number', default: 10, min: 0, max: 10 });

Rotator.prototype.update = function (dt) {
    this.entity.rotateLocal(0, this.speed, 0);
};

```

transforms it into the modern ESM Scripts format 

```javascript
import { Script } from 'playcanvas'

import { Script, Vec2, Vec3, Vec4, Color } from "playcanvas";

export class Rotator extends Script {
    /** 
     * @attribute
     * @type {number}
     * @range [0, 10]
     */
    speed = 10;

    update(dt) {
        this.entity.rotateLocal(0, this.speed, 0);
    }
}

```

It will map any attribute properties to their relevant jsdocs tags [according to the spec](https://github.com/playcanvas/editor/issues/1148), and export all classes in the correct format. It will also handle enums correctly.
