/** Turn camelCase into kebab-case. */
function toKebab(string) {
    return string.replace(/[A-Z]/g, char => '_' + char.toLowerCase())
}

/** Generate css transition styles. */
function style(properties, duration, timingFunction) {
    return properties
        .filter(name => !name.startsWith('transition'))
        .map(name => `${duration}s ${timingFunction} ${toKebab(name)}`)
        .join(',')
}

/** Emit events in functional components. */
function emit(listeners, eventName, ...args) {
    const listener = listeners[eventName]
    if (listener instanceof Array) {
        listener.forEach(func => func(...args))
    } else if (listener instanceof Function) {
        listener(...args)
    }
}

/** Store properties into dataset. */
function store(element, properties) {
    properties.forEach(name => {
        element.dataset[name] = element.style[name]
    })
}

/** Restore properties from dataset. */
function restore(element, properties) {
    properties.forEach(name => {
        element.style[name] = element.dataset[name]
    })
}

module.exports = {
    toKebab,
    style,
    emit,
    store,
    restore,
}
