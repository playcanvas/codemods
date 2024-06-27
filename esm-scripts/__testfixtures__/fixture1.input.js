var ClassName = pc.createScript('className');

const N = 10;

ClassName.attributes.add('myNumber', {
    type: 'number',
    min: 0,
    max: 10,
    description: 'This is a number',
    default: 11,
});
ClassName.attributes.add('myStr', {
    type: 'string',
    description: 'Oh and this is a string',
});

ClassName.attributes.add('someEnum', {
    type: 'number',
    description: 'Oh and this is an enum',
    enum: [
        { 'valueOne': 1 },
        { 'valueTwo': 2 },
        { 'valueThree': 3 }
    ]
});

ClassName.attributes.add('someComplex', {
    type: 'json',
    description: 'Oh and this is an complex type',
    array: true,
    schema: [
        {
            name: 'useSharedArrayBuffer',
            type: 'boolean',
            title: 'Enable Shared Array Buffer',
            description: 'Will use Shared Array Buffer for communication between frontend and backend. Falls back to Array Buffer if not available.',
            default: true
        }, {
            name: 'commandsBufferSize',
            type: 'number',
            title: 'Commands Buffer Size',
            description: 'The size of the commands buffer in bytes (a buffer used for communication between frontend and backend).',
            default: 10000
        }
    ]
});

ClassName.attributes.add('myEntities', { type: 'entity', array: true });
ClassName.attributes.add('myVec2', { type: 'vec2', default: [1, 2] });
ClassName.attributes.add('myVec3', { type: 'vec3', default: [1, 2, 3] });
ClassName.attributes.add('myVec4', { type: 'vec4', default: [1, 2, 3] });
ClassName.attributes.add('myColor', { type: 'rgba', default: [1, 2, 3, 1] });
ClassName.attributes.add('myAsset', { type: 'asset', assetType: 'texture' });
ClassName.attributes.add('myBoolean', { type: 'boolean', default: true });

ClassName.prototype.initialize = function () {
    // this is my initialize body

    console.log('Hello, World!');
};

ClassName.prototype.update = function (dt) {
    // this is my update body
};

ClassName.prototype.swap = function (dt) {
    // this is my swap body
};

var OtherGenericName = pc.createScript('otherScript');
OtherGenericName.attributes.add('test', { type: 'number' });
OtherGenericName.prototype.update = function (dt) {
    this.entity.rotateLocal(0, dt, 0);
};
