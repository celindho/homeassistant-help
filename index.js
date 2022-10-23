const yaml = require("js-yaml");
const fs = require("fs");

// Get document, or throw exception on error
try {
    const doc = yaml.load(
        fs.readFileSync("../homeassistant-settings/automations.yaml", "utf8")
    );

    var ikea5_automations = doc.filter((automation) => {
        return (
            automation.use_blueprint &&
            automation.use_blueprint.path == "celindho/ikea5button.yaml"
        );
    });

    var huedimmer_automations = doc.filter((automation) => {
        return (
            automation.use_blueprint &&
            automation.use_blueprint.path == "celindho/huedimmer.yaml"
        );
    });

    console.log("Ikea5:\n\t" + JSON.stringify(parseIkea5(ikea5_automations)));
    console.log(
        "Hue dimmers:\n\t" +
            JSON.stringify(parseHueDimmer(huedimmer_automations))
    );
} catch (e) {
    console.log(e);
}

function parseIkea5(automations) {
    var button_configs = automations.map((automation) => {
        var button_config = {
            name: automation.alias,
            middle: parseIkea5Input(automation.use_blueprint.input, 1),
            up: parseIkea5Input(automation.use_blueprint.input, 2),
            down: parseIkea5Input(automation.use_blueprint.input, 3),
            left: parseIkea5Input(automation.use_blueprint.input, 4),
            right: parseIkea5Input(automation.use_blueprint.input, 5),
        };
        return button_config;
    });
    return button_configs;
}

function parseIkea5Input(autInput, buttonCode) {
    var light = autInput[`target_${buttonCode}002`];
    var scene_short_off = autInput[`scene_script_when_off_${buttonCode}002`];
    var scene_short_on = autInput[`scene_script_when_on${buttonCode}002`];
    var scene_long = autInput[`scene_script_${buttonCode}001`];

    return createbuttonObject(
        light,
        scene_short_off,
        scene_short_on,
        scene_long
    );
}

function parseHueDimmer(automations) {
    var button_configs = automations.map((automation) => {
        var button_config = {
            name: automation.alias,
            on: parseHueDimmerInput(automation.use_blueprint.input, 1),
            bright: parseHueDimmerInput(automation.use_blueprint.input, 2),
            dim: parseHueDimmerInput(automation.use_blueprint.input, 3),
            off: parseHueDimmerInput(automation.use_blueprint.input, 4),
        };
        return button_config;
    });
    return button_configs;
}

function parseHueDimmerInput(autInput, buttonCode) {
    var light = autInput[`target_${buttonCode}000`];
    var scene_short_off = autInput[`scene_script_when_off_${buttonCode}000`];
    var scene_short_on = autInput[`scene_script_when_on${buttonCode}000`];
    var scene_long = autInput[`scene_script_${buttonCode}001`];

    return createbuttonObject(
        light,
        scene_short_off,
        scene_short_on,
        scene_long
    );
}

function createbuttonObject(
    light,
    scene_short_off,
    scene_short_on,
    scene_long
) {
    var input = {};
    if (light) {
        input.light = { entity_id: [], device_id: [] };
        if (Array.isArray(light.entity_id)) {
            input.light.entity_id = light.entity_id;
        } else if (light.entity_id) {
            input.light.entity_id.push(light.entity_id);
        }
        if (Array.isArray(light.device_id)) {
            input.light.device_id = light.device_id;
        } else if (light.device_id) {
            input.light.device_id.push(light.device_id);
        }
    }
    if (scene_short_off)
        if (input.light) input.scene_when_off = scene_short_off;
        else input.scene_when_short = scene_short_off;
    if (scene_short_on)
        if (input.light) input.scene_when_on = scene_short_on;
        else input.scene_not_available = scene_short_on;
    if (scene_long) input.scene_when_long = scene_long;

    return input;
}
