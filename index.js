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
    return automations.map((automation) => {
        return {
            name: automation.alias,
            middle: parseIkea5Input(automation.use_blueprint.input, 1),
            up: parseIkea5Input(automation.use_blueprint.input, 2),
            down: parseIkea5Input(automation.use_blueprint.input, 3),
            left: parseIkea5Input(automation.use_blueprint.input, 4),
            right: parseIkea5Input(automation.use_blueprint.input, 5),
        };
    });
}

function parseIkea5Input(autInput, buttonCode) {
    var light = autInput[`target_${buttonCode}002`];
    var scene_short_off = autInput[`scene_script_when_off_${buttonCode}002`];
    var scene_short_on = autInput[`scene_script_when_on${buttonCode}002`];
    var scene_long = autInput[`scene_script_${buttonCode}001`];

    var input = {};
    if (light) {
        if (Array.isArray(light.entity_id)) {
            input.light = light.entity_id;
        } else {
            input.light = [];
            input.light[0] = light.entity_id;
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

function parseHueDimmer(automations) {
    return automations.map((automation) => {
        return {
            name: automation.alias,
            on: parseHueDimmerInput(automation.use_blueprint.input, 1),
            bright: parseHueDimmerInput(automation.use_blueprint.input, 2),
            dim: parseHueDimmerInput(automation.use_blueprint.input, 3),
            off: parseHueDimmerInput(automation.use_blueprint.input, 4),
        };
    });
}

function parseHueDimmerInput(autInput, buttonCode) {
    var light = autInput[`target_${buttonCode}000`];
    var scene_short_off = autInput[`scene_script_when_off_${buttonCode}000`];
    var scene_short_on = autInput[`scene_script_when_on${buttonCode}000`];
    var scene_long = autInput[`scene_script_${buttonCode}001`];

    var input = {};
    if (light) input.light = light;
    if (scene_short_off)
        if (input.light) input.scene_when_off = scene_short_off;
        else input.scene_when_short = scene_short_off;
    if (scene_short_on)
        if (input.light) input.scene_when_on = scene_short_on;
        else input.scene_not_available = scene_short_on;
    if (scene_long) input.scene_when_long = scene_long;

    return input;
}