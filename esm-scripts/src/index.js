/**
 * A jscodeshift transform function that transforms the older playcanvas pc.createScript() syntax to the new ES6 class syntax.
 */

const scriptNameMap = {
    vec2: 'Vec2',
    vec3: 'Vec3',
    vec4: 'Vec4',
    rgba: 'Color',
    rgb: 'Color',
    curve: 'Curve',
};

const supportedTypes = Object.values(scriptNameMap);

/**
 * Creates an AST node for a class property with a comment block.
 * @param {*} j
 * @param {*} name - The name of the property
 * @param {*} type - The type of the property
 * @param {*} defaultValue - The default value of the property
 * @param {*} additionalProps - Additional properties to add to the comment block
 * @returns
 */
const createProperty = (j, name, type, defaultValue, additionalProps) => {
    const { description, range, resource, precision, step, isArray } =
        additionalProps;
    const jsType = isArray ? `${type}[]` : type;

    const commentBlock = `${description && ' * ' + description + '\n *'}
* @attribute
 * @type {${jsType}}
${range && ' * @range ' + range}
${resource && ' * @resource ' + resource}
${precision && ' * @precision ' + precision}
${step && '* @step ' + step}
`.trim();

    const props = [j.commentBlock(`* \n ${commentBlock}\n `)];

    let propertyValue = null;

    if (defaultValue) {
        if (supportedTypes.includes(type)) {
            propertyValue = j.newExpression(
                j.identifier(type),
                defaultValue.elements,
            );
        } else {
            propertyValue = defaultValue;
        }
    }

    const property = j.classProperty(j.identifier(name), propertyValue);

    property.comments = props;

    return property;
};

export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const enumClasses = [];
    const imports = new Set();

    // Find all the pc.createScript() calls in the file
    const scripts = root.find(j.VariableDeclaration).filter((path) => {
        const declaration = path.value.declarations[0];
        return (
            declaration.init &&
            declaration.init.callee &&
            declaration.init.callee.object &&
            declaration.init.callee.object.name === 'pc' &&
            declaration.init.callee.property &&
            declaration.init.callee.property.name === 'createScript'
        );
    });

    // For each script, create a new class declaration
    scripts.forEach((path) => {
        const declaration = path.value.declarations[0];
        const scriptName = declaration.id.name;
        const className = j.classDeclaration(
            j.identifier(scriptName),
            j.classBody([]), // Correctly create an empty class body
            j.identifier('Script'), // Extend from Script
            [],
        );
        const attributes = [];
        const methods = [];

        // Find all the attributes for the specific class name
        root.find(j.CallExpression, {
            callee: {
                object: {
                    object: { type: 'Identifier', name: scriptName },
                    property: { name: 'attributes' },
                },
                property: { name: 'add' },
            },
        }).forEach((attrPath) => {\
            // Get the attribute name and details
            const [name, details] = attrPath.value.arguments;
            const type = details.properties.find((p) => p.key.name === 'type').value.value;
            const defaultValueProp = details.properties.find((p) => p.key.name === 'default');
            const descriptionProp = details.properties.find((p) => p.key.name === 'description');
            const minProp = details.properties.find((p) => p.key.name === 'min');
            const maxProp = details.properties.find((p) => p.key.name === 'max');
            const stepProp = details.properties.find((p) => p.key.name === 'step');
            const precisionProp = details.properties.find((p) => p.key.name === 'precision');
            const assetTypeProp = details.properties.find((p) => p.key.name === 'assetType');
            const arrayProp = details.properties.find((p) => p.key.name === 'array');
            const enumProp = details.properties.find((p) => p.key.name === 'enum');

            const additionalProps = {
                description: descriptionProp ? descriptionProp.value.value : '',
                range:
                    minProp && maxProp
                        ? `[${minProp.value.value}, ${maxProp.value.value}]`
                        : '',
                resource: assetTypeProp ? assetTypeProp.value.value : '',
                precision: precisionProp ? precisionProp.value.value : '',
                step: stepProp ? stepProp.value.value : '',
                isArray: arrayProp ? arrayProp.value.value : false,
            };

            let jsType = scriptNameMap[type] || type;
            const defaultValue = defaultValueProp
                ? defaultValueProp.value
                : null;

            // Add the import statement for the type
            console.log(jsType);
            if (supportedTypes.includes(jsType)) {
                imports.add(jsType);
            }

            // handle enums
            if (enumProp) {
                const enumName = `${
                    name.value.charAt(0).toUpperCase() + name.value.slice(1)
                }Enum`;
                additionalProps.enumClass = enumName;
                const enumElements = enumProp.value.elements.map((el) => {
                    const key = Object.keys(el.properties[0].key).includes('name')
                        ? el.properties[0].key.name
                        : el.properties[0].key.value;
                    const value = el.properties[0].value.value;
                    return { key, value };
                });

                const enumClass = j.classDeclaration(
                    j.identifier(enumName),
                    j.classBody(
                        enumElements.map((el) =>
                            j.classProperty(
                                j.identifier(el.key),
                                j.literal(el.value),
                            ),
                        ),
                    ),
                    null,
                    [],
                );

                enumClass.comments = [
                    j.commentBlock(`** @interface {${type}}`),
                ];

                enumClasses.push(enumClass);
                jsType = enumName;
            }

            attributes.push(
                createProperty(
                    j,
                    name.value,
                    jsType,
                    defaultValue,
                    additionalProps,
                ),
            );
        });

        // Find methods defined with ClassName.prototype.methodName = function () { ... }
        root.find(j.ExpressionStatement, {
            expression: {
                left: {
                    object: {
                        object: { type: 'Identifier', name: scriptName },
                        property: { name: 'prototype' },
                    },
                    property: { type: 'Identifier' },
                },
                right: {
                    type: 'FunctionExpression',
                },
            },
        }).forEach((methodPath) => {
            const methodName = methodPath.value.expression.left.property.name;
            const method = j.methodDefinition(
                'method',
                j.identifier(methodName),
                methodPath.value.expression.right,
            );
            methods.push(method);
            j(methodPath).remove();
        });

        // Add the methods and attributes to the class body
        className.body.body.push(...attributes, ...methods);

        // Replace the pc.createScript() call with an export statement
        j(path).replaceWith(j.exportNamedDeclaration(className, []));

        // Remove the attribute add calls
        root.find(j.CallExpression, {
            callee: {
                object: {
                    object: { type: 'Identifier', name: scriptName },
                    property: { name: 'attributes' },
                },
                property: { name: 'add' },
            },
        }).forEach((attrPath) => {
            j(attrPath).remove();
        });
    });

    // Add the enum classes at the top of the file
    enumClasses.forEach((enumClass) => {
        root.get().node.program.body.unshift(enumClass);
    });

    const deps = Array.from(imports).map((importName) => {
        return j.importSpecifier(j.identifier(importName));
    });

    // Add the import statement
    const importStatement = j.importDeclaration(deps, j.literal('playcanvas'));
    if (deps.length > 0) root.get().node.program.body.unshift(importStatement);

    return root.toSource();
}
