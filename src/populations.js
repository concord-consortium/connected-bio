
module.exports = {
    Events: require_brunch('events'),
    // Models
    Agent: require_brunch('models/agent'),
    // Models/Agents
    AnimatedAgent: require_brunch('models/agents/animated-agent'),
    BasicAnimal: require_brunch('models/agents/basic-animal'),
    BasicPlant: require_brunch('models/agents/basic-plant'),
    FastPlant: require_brunch('models/agents/fast-plant'),
    Inanimate: require_brunch('models/inanimate'),
    // Models
    Environment: require_brunch('models/environment'),
    Rule: require_brunch('models/rule'),
    Species: require_brunch('models/species'),
    Trait: require_brunch('models/trait'),
    // UI
    Interactive: require_brunch('ui/interactive'),
    Toolbar: require_brunch('ui/toolbar'),
    ToolButton: require_brunch('ui/tool-button'),

    EnvironmentView: require_brunch('views/environment-view'),
    Events: require_brunch('events')
};
