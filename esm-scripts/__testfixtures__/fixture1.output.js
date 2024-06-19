import { Script, Vec2, Vec3, Vec4, Color } from "playcanvas";

/*** @interface {number}*/
class SomeEnumEnum {
    valueOne = 1;
    valueTwo = 2;
    valueThree = 3;
}

export class ClassName extends Script {
    /** 
     * This is a number
     *
     * @attribute
     * @type {number}
     * @range [0, 10]
     */
    myNumber = 11;

    /** 
     * Oh and this is a string
     *
     * @attribute
     * @type {string}
     */
    myStr;

    /** 
     * Oh and this is an enum
     *
     * @attribute
     * @type {SomeEnumEnum}
     */
    someEnum;

    /** 
     * @attribute
     * @type {entity[]}
     */
    myEntities;

    /** 
     * @attribute
     * @type {Vec2}
     */
    myVec2 = new Vec2(1, 2);

    /** 
     * @attribute
     * @type {Vec3}
     */
    myVec3 = new Vec3(1, 2, 3);

    /** 
     * @attribute
     * @type {Vec4}
     */
    myVec4 = new Vec4(1, 2, 3);

    /** 
     * @attribute
     * @type {Color}
     */
    myColor = [1, 2, 3, 1];

    /** 
     * @attribute
     * @type {asset}
     
     * @resource texture
     */
    myAsset;

    /** 
     * @attribute
     * @type {boolean}
     */
    myBoolean = true;

    initialize() {
        // this is my initialize body

        console.log('Hello, World!');
    }

    update(dt) {
        // this is my update body
    }

    swap(dt) {
        // this is my swap body
    }
}

const N = 10;

export class OtherGenericName extends Script {
    /** 
     * @attribute
     * @type {number}
     */
    test;

    update(dt) {
        this.entity.rotateLocal(0, dt, 0);
    }
}
