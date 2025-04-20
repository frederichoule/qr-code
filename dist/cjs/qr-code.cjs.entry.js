'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-f42c9c9c.js');

const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
const uuid = () => s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();

function isDefined(a) {
    return !!a || a === 0 || a === false;
}
function isFunction(a) {
    return typeof a === 'function';
}
function isNumber(a) {
    return typeof a === 'number';
}
function isObject(a) {
    return typeof a === 'object' && !!a;
}
function isString(a) {
    return typeof a === 'string';
}
function isArrayLike(a) {
    return a && isFinite(a.length) && !isString(a) && !isFunction(a);
}
function isDOM(target) {
    return target.nodeType || target instanceof SVGElement;
}
function isOwner(obj, name) {
    return obj.hasOwnProperty(name);
}

const S_INACTIVE = 1;
const S_PAUSED = 2;
const S_PLAYING = 3;
const _ = undefined;
const CONFIG = 'config';

function includes(items, item) {
    return getIndex(items, item) !== -1;
}
function getIndex(items, item) {
    return items.indexOf(item);
}
function find$1(indexed, predicate, reverse) {
    const ilen = indexed && indexed.length;
    if (!ilen) {
        return _;
    }
    if (predicate === _) {
        return indexed[reverse ? ilen - 1 : 0];
    }
    if (reverse) {
        for (let i = ilen - 1; i > -1; i--) {
            if (predicate(indexed[i])) {
                return indexed[i];
            }
        }
    }
    else {
        for (let i = 0; i < ilen; i++) {
            if (predicate(indexed[i])) {
                return indexed[i];
            }
        }
    }
    return _;
}
function remove(items, item) {
    const index = items.indexOf(item);
    return index !== -1 ? items.splice(index, 1) : _;
}
function sortBy(fieldName) {
    return (a, b) => {
        const a1 = a[fieldName];
        const b1 = b[fieldName];
        return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
    };
}
function list(indexed) {
    return !isDefined(indexed) ? [] : isArrayLike(indexed) ? indexed : [indexed];
}
function push(indexed, item) {
    if (item !== _) {
        Array.prototype.push.call(indexed, item);
    }
    return item;
}
function pushDistinct(indexed, item) {
    if (!includes(indexed, item)) {
        push(indexed, item);
    }
    return item;
}
function mapFlatten(items, mapper) {
    var results = [];
    all(items, item => {
        var result = mapper(item);
        if (isArrayLike(result)) {
            all(result, item2 => push(results, item2));
        }
        else {
            push(results, result);
        }
    });
    return results;
}
function all(items, action) {
    const items2 = list(items);
    for (let i = 0, ilen = items2.length; i < ilen; i++) {
        action(items2[i], i, ilen);
    }
}

const APPEND = 'append';
const CANCEL = 'cancel';
const DESTROY = 'destroy';
const FINISH = 'finish';
const INSERT = 'insert';
const PAUSE = 'pause';
const PLAY = 'play';
const REVERSE = 'reverse';
const SET = 'set';
const TICK = 'tick';
const UPDATE = 'update';
const UPDATE_RATE = 'rate';
const UPDATE_TIME = 'time';

const raf = requestAnimationFrame;
const caf = cancelAnimationFrame;
const now = () => performance.now();
const active = [];
let lastHandle = _;
let lastTime = _;
function cancel$1() {
    caf(lastHandle);
    lastHandle = lastTime = _;
}
function update$1() {
    const len = active.length;
    lastTime = lastTime || now();
    if (!len) {
        cancel$1();
        return;
    }
    const thisTime = now();
    const delta = thisTime - lastTime;
    lastTime = thisTime;
    lastHandle = raf(update$1);
    for (let i = len - 1; i > -1; i--) {
        const activeId = active[i];
        dispatch(TICK, activeId, delta);
    }
}
function loopOn(id) {
    if (!includes(active, id)) {
        push(active, id);
    }
    if (!lastHandle) {
        lastHandle = raf(update$1);
    }
}
function loopOff(id) {
    if (remove(active, id)) ;
    if (!active.length) {
        cancel$1();
    }
}

const cancel = (model, _data, ctx) => {
    all(model.players, effect => effect.cancel());
    model.state = S_INACTIVE;
    model.time = _;
    model.round = _;
    model.players = _;
    loopOff(model.id);
    ctx.trigger(CANCEL);
};

const destroy = (model, _data, ctx) => {
    cancel(model, _, ctx);
    ctx.destroyed = true;
};

const flr = Math.floor;
const max = Math.max;
const min = Math.min;
function inRange(val, a, z) {
    return val !== _ && a <= val && val <= z;
}
function minMax(val, a, z) {
    return min(max(val, a), z);
}

const plugins = {};
function addPlugin(plugin) {
    plugins[plugin.name] = plugin;
}

let refId = 0;
const objNameExp = /\[object ([a-z]+)\]/i;
function getName(target) {
    let name = target.id || target.name;
    if (!name) {
        name = Object.prototype.toString.call(target);
        const matches = objNameExp.exec(name);
        if (matches) {
            name = matches[1];
        }
    }
    return '@' + name + '_' + ++refId;
}
function assignRef(refs, target) {
    for (var ref in refs) {
        if (refs[ref] === target) {
            return ref;
        }
    }
    const refName = getName(target);
    refs[refName] = target;
    return refName;
}
function replaceWithRefs(refs, target, recurseObjects) {
    if (!isDefined(target) || isString(target) || isNumber(target)) {
        return target;
    }
    if (isArrayLike(target)) {
        return mapFlatten(target, (t) => replaceWithRefs(refs, t, recurseObjects));
    }
    if (isFunction(target)) {
        return assignRef(refs, target);
    }
    if (recurseObjects) {
        for (var name in target) {
            if (isOwner(target, name)) {
                target[name] = replaceWithRefs(refs, target[name], recurseObjects && name !== 'targets');
            }
        }
        return target;
    }
    return assignRef(refs, target);
}
function resolveRefs(refs, value, recurseObjects) {
    if (!isDefined(value) || isNumber(value) || isFunction(value)) {
        return value;
    }
    if (isString(value)) {
        const str = value;
        return isOwner(refs, str) && str.charAt(0) === '@' ? refs[str] : str;
    }
    if (isArrayLike(value)) {
        const results = [];
        all(value, item => push(results, resolveRefs(refs, item, recurseObjects)));
        return results;
    }
    if (!recurseObjects || isDOM(value)) {
        return value;
    }
    var obj2 = {};
    for (var name in value) {
        if (isOwner(value, name)) {
            const value2 = value[name];
            obj2[name] = recurseObjects ? resolveRefs(refs, value2, name !== 'targets') : value2;
        }
    }
    return obj2;
}

function getTargets(target) {
    return isString(target)
        ? Array.prototype.slice.call(document.querySelectorAll(target))
        :
            isFunction(target)
                ? getTargets(target())
                :
                    isArrayLike(target)
                        ? mapFlatten(target, getTargets)
                        :
                            isObject(target)
                                ? [target]
                                :
                                    [];
}

function assign() {
    var result = {};
    all(arguments, obj => {
        for (var name in obj) {
            if (isOwner(obj, name)) {
                result[name] = obj[name];
            }
        }
    });
    return result;
}

function resolveProperty(input, target, index, len) {
    return isFunction(input)
        ? resolveProperty(input(target, index, len), target, index, len)
        : input;
}

const offsetSorter = sortBy('offset');
function toEffects(config) {
    const keyframes = config.keyframes;
    const from = config.from;
    const to = config.to;
    const stagger = config.stagger || 0;
    const duration = config.duration;
    const result = [];
    all(getTargets(config.target), (target, index, targetLength) => {
        var effects = {};
        var propToPlugin = {};
        all(keyframes, p => {
            const effects3 = effects[p.prop] || (effects[p.prop] = []);
            const offset = (p.time - from) / (duration || 1);
            const easing = p.easing;
            const interpolate = p.interpolate;
            const value = resolveProperty(p.value, target, p.index, targetLength);
            propToPlugin[p.prop] = p.plugin;
            const effect2 = find$1(effects3, e => e.offset === offset) ||
                push(effects3, {
                    easing,
                    offset,
                    value,
                    interpolate
                });
            effect2.easing = easing;
            effect2.value = value;
            effect2.interpolate = interpolate;
        });
        for (var pluginName in plugins) {
            var plugin2 = plugins[pluginName];
            if (plugin2.onWillAnimate && config.keyframes.some(c => c.plugin === pluginName)) {
                var targetConfig2 = assign(config, { target });
                plugin2.onWillAnimate(targetConfig2, effects, propToPlugin);
            }
        }
        for (var prop in effects) {
            var effects2 = effects[prop];
            var pluginName2 = propToPlugin[prop];
            var plugin = plugins[pluginName2];
            if (effects2) {
                effects2.sort(offsetSorter);
                ensureFirstFrame(config, effects2, target, plugin, prop);
                fillValues(effects2);
                fillInterpolators(effects2);
                ensureLastFrame(config, effects2);
                push(result, {
                    plugin: propToPlugin[prop],
                    target,
                    prop,
                    from: from + (stagger ? stagger * index : 0),
                    to: to + (stagger ? stagger * index : 0),
                    keyframes: effects2
                });
            }
        }
    });
    return result;
}
function fillValues(items) {
    var lastValue;
    all(items, item => {
        if (item.value !== _) {
            lastValue = item.value;
        }
        else {
            item.value = lastValue;
        }
    });
}
function fillInterpolators(items) {
    var lastInterpolator;
    for (var y = items.length - 1; y > -1; y--) {
        var item2 = items[y];
        if (item2.interpolate !== _) {
            lastInterpolator = item2.interpolate;
        }
        else {
            item2.interpolate = lastInterpolator;
        }
    }
}
function ensureFirstFrame(config, items, target, plugin, prop) {
    var firstFrame = find$1(items, c => c.offset === 0);
    if (firstFrame === _ || firstFrame.value === _) {
        var value2 = plugin.getValue(target, prop);
        if (firstFrame === _) {
            items.splice(0, 0, {
                offset: 0,
                value: value2,
                easing: config.easing,
                interpolate: _
            });
        }
        else {
            firstFrame.value = value2;
            firstFrame.easing = config.easing;
            firstFrame.interpolate = _;
        }
    }
}
function ensureLastFrame(config, items) {
    var lastFrame = find$1(items, c => c.offset === 1, true);
    if (lastFrame === _ || lastFrame.value === _) {
        var value3 = items[items.length - 1].value;
        if (lastFrame === _) {
            push(items, {
                offset: 1,
                value: value3,
                easing: config.easing,
                interpolate: _
            });
        }
        else {
            lastFrame.value = value3;
            lastFrame.easing = lastFrame.easing || config.easing;
        }
    }
}

function calculatePlayers(model) {
    model.duration = max.apply(_, model.players.filter(a => isFinite(a.to)).map(a => a.to));
    model.time = isFinite(model.time) ? model.time : model.rate < 0 ? model.duration : 0;
}

function setup(model) {
    model.players = [];
    all(model.configs, config => setupTarget(model, config));
    calculatePlayers(model);
}
function setupTarget(model, config) {
    const resolvedConfig = resolveRefs(model.refs, config, true);
    const effects = toEffects(resolvedConfig);
    all(effects, effect => {
        const player = plugins[effect.plugin].animate(effect);
        if (player) {
            player.from = effect.from;
            player.to = effect.to;
            push(model.players, player);
        }
    });
}

const update = (model, _data, ctx) => {
    if (model.players === _) {
        setup(model);
    }
    const isPlaying = model.state === S_PLAYING;
    const time = model.time;
    if (!isPlaying) {
        loopOff(model.id);
    }
    all(model.players, player => {
        const from = player.from;
        const to = player.to;
        const isActive = isPlaying && inRange(flr(time), from, to);
        const offset = minMax((time - from) / (to - from), 0, 1);
        player.update(offset, model.rate, isActive);
    });
    ctx.trigger(UPDATE);
};

const finish = (model, _data, ctx) => {
    model.round = 0;
    model.state = S_PAUSED;
    if (!model.yoyo) {
        model.time = model.rate < 0 ? 0 : model.duration;
    }
    loopOff(model.id);
    update(model, _, ctx);
    ctx.trigger(FINISH);
    if (model.destroy) {
        destroy(model, _, ctx);
    }
};

const pause = (model, _data, ctx) => {
    model.state = S_PAUSED;
    loopOff(model.id);
    update(model, _, ctx);
    ctx.trigger(PAUSE);
};

const play = (model, options, ctx) => {
    if (options) {
        model.repeat = options.repeat;
        model.yoyo = !!options.alternate;
        model.destroy = !!options.destroy;
    }
    model.repeat = model.repeat || 1;
    model.yoyo = model.yoyo || false;
    model.state = S_PLAYING;
    const isForwards = model.rate >= 0;
    if (isForwards && model.time === model.duration) {
        model.time = 0;
    }
    else if (!isForwards && model.time === 0) {
        model.time = model.duration;
    }
    loopOn(model.id);
    update(model, _, ctx);
    ctx.trigger(PLAY);
};

const reverse = (model, _data, ctx) => {
    model.rate *= -1;
    update(model, _, ctx);
    ctx.trigger(REVERSE);
};

const tick = (model, delta, _ctx) => {
    const duration = model.duration;
    const repeat = model.repeat;
    const rate = model.rate;
    let time = model.time === _ ? (rate < 0 ? duration : 0) : model.time;
    let round = model.round || 0;
    const isReversed = rate < 0;
    time += delta * rate;
    let iterationEnded = false;
    if (!inRange(time, 0, duration)) {
        model.round = ++round;
        time = isReversed ? 0 : duration;
        iterationEnded = true;
        if (model.yoyo) {
            model.rate = (model.rate || 0) * -1;
        }
        time = model.rate < 0 ? duration : 0;
    }
    model.time = time;
    model.round = round;
    if (iterationEnded && repeat === round) {
        finish(model, _, _ctx);
        return;
    }
    update(model, _, _ctx);
};

const updateRate = (model, rate, ctx) => {
    model.rate = rate || 1;
    update(model, _, ctx);
};

const updateTime = (model, time, ctx) => {
    const currentTime = +time;
    model.time = isFinite(currentTime) ? currentTime : model.rate < 0 ? model.duration : 0;
    update(model, _, ctx);
};

const calculateConfigs = (model) => {
    var maxTo = 0;
    var cursor = 0;
    var configs = model.configs;
    for (var i = 0, ilen = configs.length; i < ilen; i++) {
        var config = configs[i];
        var times = config.keyframes.map(k => k.time);
        var to = max.apply(_, times);
        var from = min.apply(_, times);
        config.to = to;
        config.from = from;
        config.duration = to - from;
        maxTo = max(to, maxTo);
        cursor = max(to + config.endDelay, cursor);
    }
    model.cursor = cursor;
    model.duration = maxTo;
};

const propKeyframeSort = sortBy('time');
const insert = (model, options, ctx) => {
    all(options, opts => {
        if (opts.to === _) {
            throw new Error('missing duration');
        }
        opts = replaceWithRefs(model.refs, opts, true);
        all(opts.targets, (target, i, ilen) => {
            const config = addPropertyKeyframes(model, target, i, ilen, opts);
            ctx.dirty(config);
        });
    });
    calculateConfigs(model);
    ctx.trigger(CONFIG);
};
function addPropertyKeyframes(model, target, index, ilen, opts) {
    const defaultEasing = 'ease';
    const delay = resolveProperty(opts.delay, target, index, ilen) || 0;
    const config = find$1(model.configs, c => c.target === target) ||
        push(model.configs, {
            from: max(opts.from + delay, 0),
            to: max(opts.to + delay, 0),
            easing: opts.easing || defaultEasing,
            duration: opts.to - opts.from,
            endDelay: resolveProperty(opts.endDelay, target, index, ilen) || 0,
            stagger: opts.stagger || 0,
            target,
            targetLength: ilen,
            propNames: [],
            keyframes: []
        });
    const staggerMs = (opts.stagger && opts.stagger * (index + 1)) || 0;
    const delayMs = resolveProperty(opts.delay, config, index, config.targetLength) || 0;
    const from = max(staggerMs + delayMs + opts.from, 0);
    const duration = opts.to - opts.from;
    const easing = opts.easing || defaultEasing;
    for (var pluginName in plugins) {
        if (isOwner(opts, pluginName)) {
            const props = opts[pluginName];
            for (var name in props) {
                var propVal = props[name];
                if (isOwner(props, name) && isDefined(propVal)) {
                    addProperty(config, pluginName, index, name, propVal, duration, from, easing);
                }
            }
        }
    }
    config.keyframes.sort(propKeyframeSort);
    return config;
}
function addProperty(config, plugin, index, name, val, duration, from, defaultEasing) {
    let defaultInterpolator;
    let values;
    const isValueObject = !isArrayLike(val) && isObject(val);
    if (isValueObject) {
        const objVal = val;
        if (objVal.easing) {
            defaultEasing = objVal.easing;
        }
        if (objVal.interpolate) {
            defaultInterpolator = objVal.interpolate;
        }
        values = list(objVal.value);
    }
    else {
        values = list(val);
    }
    const keyframes = values.map((v, i, vals) => {
        const valOrObj = resolveProperty(v, config.target, index, config.targetLength);
        const valObj = valOrObj;
        const isObj2 = isObject(valOrObj);
        const value = isObj2 ? valObj.value : valOrObj;
        const offset = isObj2 && isNumber(valObj.offset)
            ?
                valObj.offset
            : i === vals.length - 1
                ?
                    1
                : i === 0
                    ?
                        0
                    : _;
        const interpolate = (valObj && valObj.interpolate) || defaultInterpolator;
        const easing = (valObj && valObj.easing) || defaultEasing;
        return { offset, value, easing, interpolate };
    });
    inferOffsets(keyframes);
    all(keyframes, keyframe => {
        const { offset, value } = keyframe;
        const time = flr(duration * offset + from);
        const frame = find$1(config.keyframes, k => k.prop === name && k.time === time) ||
            push(config.keyframes, {
                plugin,
                easing: keyframe.easing,
                index,
                prop: name,
                time,
                value,
                interpolate: keyframe.interpolate
            });
        frame.value = value;
    });
    find$1(config.keyframes, k => k.prop === name && k.time === from) ||
        push(config.keyframes, {
            plugin,
            easing: defaultEasing,
            index,
            prop: name,
            time: from,
            value: _,
            interpolate: defaultInterpolator
        });
    var to = from + duration;
    find$1(config.keyframes, k => k.prop === name && k.time === to, true) ||
        push(config.keyframes, {
            plugin,
            easing: defaultEasing,
            index,
            prop: name,
            time: to,
            value: _,
            interpolate: defaultInterpolator
        });
    pushDistinct(config.propNames, name);
}
function inferOffsets(keyframes) {
    if (!keyframes.length) {
        return;
    }
    const first = find$1(keyframes, k => k.offset === 0) || keyframes[0];
    if (!isDefined(first.offset)) {
        first.offset = 0;
    }
    const last = find$1(keyframes, k => k.offset === 1, true) || keyframes[keyframes.length - 1];
    if (keyframes.length > 1 && !isDefined(last.offset)) {
        last.offset = 1;
    }
    for (let i = 1, ilen = keyframes.length; i < ilen; i++) {
        const target = keyframes[i];
        if (!isDefined(target.offset)) {
            for (let j = i + 1; j < ilen; j++) {
                const endTime = keyframes[j].offset;
                if (isDefined(endTime)) {
                    const startTime = keyframes[i - 1].offset;
                    const timeDelta = endTime - startTime;
                    const deltaLength = j - i + 1;
                    for (let k = 1; k < deltaLength; k++) {
                        keyframes[k - 1 + i].offset = k / j * timeDelta + startTime;
                    }
                    i = j;
                    break;
                }
            }
        }
    }
}

const append = (model, data, ctx) => {
    const cursor = model.cursor;
    const opts2 = list(data).map(opt => {
        const { to, from, duration } = opt;
        const hasTo = isDefined(to);
        const hasFrom = isDefined(from);
        const hasDuration = isDefined(duration);
        const opt2 = opt;
        opt2.to =
            hasTo && (hasFrom || hasDuration)
                ? to
                : hasDuration && hasFrom
                    ? from + duration
                    : hasTo && !hasDuration ? cursor + to : hasDuration ? cursor + duration : _;
        opt2.from =
            hasFrom && (hasTo || hasDuration)
                ? from
                : hasTo && hasDuration ? to - duration : hasTo || hasDuration ? cursor : _;
        return opt2;
    });
    insert(model, opts2, ctx);
};

const set = (model, options, ctx) => {
    const pluginNames = Object.keys(plugins);
    const opts2 = list(options).map(opts => {
        const at = opts.at || model.cursor;
        const opt2 = {};
        for (var name in opts) {
            if (includes(pluginNames, name)) {
                const props = opts[name];
                const props2 = {};
                for (var propName in props) {
                    var value = props[propName];
                    props2[propName] = [_, value];
                }
                opt2[name] = props2;
            }
            else {
                opt2[name] = opts[name];
            }
        }
        opt2.from = at - 0.000000001;
        opt2.to = at;
        return opt2;
    });
    insert(model, opts2, ctx);
};

function rebuild(model, ctx) {
    const state = model.state;
    all(model.players, p => p.cancel());
    model.players = _;
    switch (state) {
        case S_PAUSED:
            pause(model, _, ctx);
            break;
        case S_PLAYING:
            play(model, _, ctx);
            break;
    }
}

const stateSubs = [];
const stores = {};
const reducers = {
    [APPEND]: append,
    [CANCEL]: cancel,
    [DESTROY]: destroy,
    [FINISH]: finish,
    [INSERT]: insert,
    [PAUSE]: pause,
    [PLAY]: play,
    [REVERSE]: reverse,
    [SET]: set,
    [TICK]: tick,
    [UPDATE]: update,
    [UPDATE_RATE]: updateRate,
    [UPDATE_TIME]: updateTime
};
function createInitial(opts) {
    const refs = {};
    if (opts.references) {
        for (var name in opts.references) {
            refs['@' + name] = opts.references[name];
        }
    }
    const newModel = {
        configs: [],
        cursor: 0,
        duration: 0,
        id: opts.id,
        players: _,
        rate: 1,
        refs: refs,
        repeat: _,
        round: _,
        state: S_INACTIVE,
        time: _,
        yoyo: false
    };
    return newModel;
}
function getState(id) {
    const model = stores[id];
    if (!model) {
        throw new Error('not found');
    }
    return model.state;
}
function addState(opts) {
    stores[opts.id] = {
        state: createInitial(opts),
        subs: {}
    };
}
function on(id, eventName, listener) {
    const store = stores[id];
    if (store) {
        const subs = (store.subs[eventName] = store.subs[eventName] || []);
        pushDistinct(subs, listener);
    }
}
function off(id, eventName, listener) {
    const store = stores[id];
    if (store) {
        remove(store.subs[eventName], listener);
    }
}
function dispatch(action, id, data) {
    const fn = reducers[action];
    const store = stores[id];
    if (!fn || !store) {
        throw new Error('not found');
    }
    const ctx = {
        events: [],
        needUpdate: [],
        trigger,
        dirty
    };
    const model = store.state;
    fn(model, data, ctx);
    all(ctx.events, evt => {
        const subs = store.subs[evt];
        if (subs) {
            all(subs, sub => {
                sub(model.time);
            });
        }
    });
    if (ctx.destroyed) {
        delete stores[id];
    }
    else if (ctx.needUpdate.length) {
        if (model.state !== S_INACTIVE) {
            rebuild(model, ctx);
        }
        else {
            calculateConfigs(model);
        }
        all(stateSubs, sub => {
            sub(store);
        });
    }
}
function trigger(eventName) {
    pushDistinct(this.events, eventName);
}
function dirty(config) {
    pushDistinct(this.needUpdate, config);
}
if (typeof window !== 'undefined') {
    window.just_devtools = {
        dispatch,
        subscribe(fn) {
            pushDistinct(stateSubs, fn);
        },
        unsubscribe(fn) {
            remove(stateSubs, fn);
        }
    };
}

const timelineProto = {
    get state() {
        return getState(this.id).state;
    },
    get duration() {
        return getState(this.id).duration;
    },
    get currentTime() {
        return getState(this.id).time;
    },
    set currentTime(time) {
        dispatch(UPDATE_TIME, this.id, time);
    },
    get playbackRate() {
        return getState(this.id).rate;
    },
    set playbackRate(rate) {
        dispatch(UPDATE_RATE, this.id, rate);
    },
    add(opts) {
        dispatch(APPEND, this.id, opts);
        return this;
    },
    animate(opts) {
        dispatch(APPEND, this.id, opts);
        return this;
    },
    fromTo(from, to, options) {
        all(options, options2 => {
            options2.to = to;
            options2.from = from;
        });
        dispatch(INSERT, this.id, options);
        return this;
    },
    cancel() {
        dispatch(CANCEL, this.id);
        return this;
    },
    destroy() {
        dispatch(DESTROY, this.id);
    },
    finish() {
        dispatch(FINISH, this.id);
        return this;
    },
    on(name, fn) {
        on(this.id, name, fn);
        return this;
    },
    once(eventName, listener) {
        const self = this;
        self.on(eventName, function s(time) {
            self.off(eventName, s);
            listener(time);
        });
        return self;
    },
    off(name, fn) {
        off(this.id, name, fn);
        return this;
    },
    pause() {
        dispatch(PAUSE, this.id);
        return this;
    },
    play(options) {
        dispatch(PLAY, this.id, options);
        return this;
    },
    reverse() {
        dispatch(REVERSE, this.id);
        return this;
    },
    seek(time) {
        dispatch(UPDATE_TIME, this.id, time);
        return this;
    },
    sequence(seqOptions) {
        all(seqOptions, opt => dispatch(APPEND, this.id, opt));
        return this;
    },
    set(opts) {
        dispatch(SET, this.id, opts);
        return this;
    }
};
function timeline(opts) {
    const t1 = Object.create(timelineProto);
    opts = opts || {};
    opts.id = opts.id || uuid();
    t1.id = opts.id;
    addState(opts);
    return t1;
}

var epsilon = 0.0001;

var c = "cubic-bezier";
var s = "steps";
var ease = c + "(.25,.1,.25,1)";
var easeIn = c + "(.42,0,1,1)";
var easeInOut = c + "(.42,0,.58,1)";
var easeOut = c + "(0,0,.58,1)";
var linear = c + "(0,0,1,1)";
var stepEnd = s + "(1,0)";
var stepStart = s + "(1,1)";

var steps = function (count, pos) {
    var q = count / 1;
    var p = pos === 'end'
        ? 0 : pos === 'start'
        ? 1 : pos || 0;
    return function (x) { return x >= 1 ? 1 : (p * q + x) - (p * q + x) % q; };
};

var bezier = function (n1, n2, t) {
    return 3 * n1 * (1 - t) * (1 - t) * t + 3 * n2 * (1 - t) * t * t + t * t * t;
};
var cubicBezier = function (p0, p1, p2, p3) {
    if (p0 < 0 || p0 > 1 || p2 < 0 || p2 > 1) {
        return function (x) { return x; };
    }
    return function (x) {
        if (x === 0 || x === 1) {
            return x;
        }
        var start = 0;
        var end = 1;
        var limit = 19;
        do {
            var mid = (start + end) * .5;
            var xEst = bezier(p0, p2, mid);
            if (abs(x - xEst) < epsilon) {
                return bezier(p1, p3, mid);
            }
            if (xEst < x) {
                start = mid;
            }
            else {
                end = mid;
            }
        } while (--limit);
        // limit is reached
        return x;
    };
};

var camelCaseRegex = /([a-z])[- ]([a-z])/ig;
var cssFunctionRegex = /^([a-z-]+)\(([^\)]+)\)$/i;
var cssEasings = { ease: ease, easeIn: easeIn, easeOut: easeOut, easeInOut: easeInOut, stepStart: stepStart, stepEnd: stepEnd, linear: linear };
var camelCaseMatcher = function (match, p1, p2) { return p1 + p2.toUpperCase(); };
var toCamelCase = function (value) { return typeof value === 'string'
    ? value.replace(camelCaseRegex, camelCaseMatcher) : ''; };
var find = function (nameOrCssFunction) {
    // search for a compatible known easing
    var easingName = toCamelCase(nameOrCssFunction);
    var easing = cssEasings[easingName] || nameOrCssFunction;
    var matches = cssFunctionRegex.exec(easing);
    if (!matches) {
        throw new Error('css parse error');
    }
    return [matches[1]].concat(matches[2].split(','));
};
var cssFunction = function (easingString) {
    var p = find(easingString);
    var fnName = p[0];
    if (fnName === 'steps') {
        return steps(+p[1], p[2]);
    }
    if (fnName === 'cubic-bezier') {
        return cubicBezier(+p[1], +p[2], +p[3], +p[4]);
    }
    throw new Error('css parse error');
};

var abs = Math.abs;

function memoize(func) {
    const cache = [];
    return function () {
        const args = arguments;
        for (var h = 0, hlen = cache.length; h < hlen; h++) {
            var keys = cache[h].args;
            var ilen = args.length;
            if (keys.length !== ilen) {
                continue;
            }
            var matches = 0;
            for (var i = 0; i < ilen; i++) {
                if (keys[i] !== args[i]) {
                    break;
                }
                ++matches;
            }
            if (matches === ilen) {
                return cache[h].value;
            }
        }
        var value = func.apply(_, args);
        cache.push({ args, value });
        return value;
    };
}

function findEndIndex(ns, n) {
    const ilen = ns.length;
    for (let i = 0; i < ilen; i++) {
        if (ns[i] > n) {
            return i;
        }
    }
    return ilen - 1;
}
const getEasing = memoize(cssFunction);
const getInterpolator = memoize((fn) => memoize(fn));
function interpolate(l, r, o) {
    return l + (r - l) * o;
}
function fallbackInterpolator(l, r, o) {
    return o < 0.5 ? l : r;
}
function interpolator(duration, keyframes) {
    const times = keyframes.map(k => k.offset * duration);
    all(keyframes, k => {
        const isSimple = !isFunction(k.interpolate);
        k.simpleFn = isSimple;
        k.interpolate = !isSimple
            ? getInterpolator(k.interpolate)
            : isNumber(k.value)
                ? interpolate
                : fallbackInterpolator;
    });
    return function (timelineOffset) {
        const absTime = duration * timelineOffset;
        const r = findEndIndex(times, absTime);
        const l = r ? r - 1 : 0;
        const rt = times[r];
        const lt = times[l];
        const lk = keyframes[l];
        const time = (absTime - lt) / (rt - lt);
        const progression = lk.easing ? getEasing(lk.easing)(time) : time;
        if (lk.simpleFn) {
            return lk.interpolate(lk.value, keyframes[r].value, progression);
        }
        return lk.interpolate(lk.value, keyframes[r].value)(progression);
    };
}

function hyphenate(value) {
    return value.replace(/([A-Z])/g, match => `-` + match[0].toLowerCase());
}

const PROPERTY = 0;
const ATTRIBUTE = 1;
const ATTRIBUTE_HYPHENATE = 2;
const CSSVAR = 3;
const cssVarExp = /^\-\-[a-z0-9\-]+$/i;
const viewbox = 'viewBox';
const svgReadonly = [viewbox];
const noHyphenate = [viewbox];
const propsPlugin = {
    name: 'props',
    animate(effect) {
        const { target, prop } = effect;
        const interpolate = interpolator(effect.to - effect.from, effect.keyframes);
        const propSetter = getTargetSetter(target, prop);
        const propGetter = getTargetGetter(target, prop);
        let initial = _;
        return {
            cancel() {
                if (initial !== _) {
                    propSetter(initial);
                }
                initial = _;
            },
            update(localTime, _playbackRate, _isActive) {
                if (initial === _) {
                    initial = propGetter();
                }
                propSetter(interpolate(localTime));
            }
        };
    },
    getValue(target, prop) {
        return getTargetGetter(target, prop)();
    }
};
function getTargetType(target, prop) {
    if (!isDOM(target)) {
        return PROPERTY;
    }
    if (cssVarExp.test(prop)) {
        return CSSVAR;
    }
    if (typeof target[prop] !== 'undefined' && !includes(svgReadonly, prop)) {
        return PROPERTY;
    }
    if (includes(noHyphenate, prop)) {
        return ATTRIBUTE;
    }
    return ATTRIBUTE_HYPHENATE;
}
function getTargetGetter(target, prop) {
    const targetType = getTargetType(target, prop);
    return targetType === CSSVAR
        ? getVariable(target, prop)
        : targetType === ATTRIBUTE
            ? getAttribute(target, prop)
            : targetType === ATTRIBUTE_HYPHENATE ? getAttributeHyphenate(target, prop) : getProperty(target, prop);
}
function getTargetSetter(target, prop) {
    const targetType = getTargetType(target, prop);
    return targetType === CSSVAR
        ? setVariable(target, prop)
        : targetType === ATTRIBUTE
            ? setAttribute(target, prop)
            : targetType === ATTRIBUTE_HYPHENATE ? setAttributeHyphenate(target, prop) : setProperty(target, prop);
}
function getAttribute(target, name) {
    return () => target.getAttribute(name);
}
function setAttribute(target, name) {
    return (value) => target.setAttribute(name, value);
}
function setAttributeHyphenate(target, name) {
    const attName = hyphenate(name);
    return (value) => target.setAttribute(attName, value);
}
function getAttributeHyphenate(target, name) {
    const attName = hyphenate(name);
    return () => target.getAttribute(attName);
}
function getVariable(target, name) {
    return () => target.style.getPropertyValue(name);
}
function setVariable(target, name) {
    return (value) => target.style.setProperty(name, value ? value + '' : '');
}
function setProperty(target, name) {
    return (value) => (target[name] = value);
}
function getProperty(target, name) {
    return () => target[name];
}

function animate(options) {
    return timeline().add(options);
}
addPlugin(propsPlugin);

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire();
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var inspect = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
function isDefined(a) {
    return !!a || a === 0 || a === false;
}
exports.isDefined = isDefined;
function isFunction(a) {
    return typeof a === 'function';
}
exports.isFunction = isFunction;
function isNumber(a) {
    return typeof a === 'number';
}
exports.isNumber = isNumber;
function isObject(a) {
    return typeof a === 'object' && !!a;
}
exports.isObject = isObject;
function isString(a) {
    return typeof a === 'string';
}
exports.isString = isString;
function isArrayLike(a) {
    return a && isFinite(a.length) && !isString(a) && !isFunction(a);
}
exports.isArrayLike = isArrayLike;
function isDOM(target) {
    return target.nodeType || target instanceof SVGElement;
}
exports.isDOM = isDOM;
function isOwner(obj, name) {
    return obj.hasOwnProperty(name);
}
exports.isOwner = isOwner;
});

var constants$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.S_INACTIVE = 1;
exports.S_PAUSED = 2;
exports.S_PLAYING = 3;
exports._ = undefined;
exports.measureExpression = /^([+|-]*[0-9]*[.]*?[0-9]+)([a-z%]+)*$/i;
exports.ALTERNATE = 'alternate';
exports.CONFIG = 'config';
exports.FATAL = 'fatal';
exports.FINISHED = 'finished';
exports.IDLE = 'idle';
exports.ITERATION = 'iteration';
exports.NORMAL = 'normal';
});

var math = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.abs = Math.abs;
exports.flr = Math.floor;
exports.max = Math.max;
exports.min = Math.min;
exports.rdm = Math.random;
exports.rnd = Math.round;
function inRange(val, a, z) {
    return val !== constants$1._ && a <= val && val <= z;
}
exports.inRange = inRange;
function minMax(val, a, z) {
    return exports.min(exports.max(val, a), z);
}
exports.minMax = minMax;
});

var strings = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

var camelCaseRegex = /([a-z])[- ]([a-z])/gi;
function camelCaseReplacer(_, p1, p2) {
    return p1 + p2.toUpperCase();
}
function toCamelCase(value) {
    return inspect.isString(value) ? value.replace(camelCaseRegex, camelCaseReplacer) : '';
}
exports.toCamelCase = toCamelCase;
function hyphenate(value) {
    return value.replace(/([A-Z])/g, function (match) { return "-" + match[0].toLowerCase(); });
}
exports.hyphenate = hyphenate;
function csvToList(data) {
    return data.split(',');
}
exports.csvToList = csvToList;
});

var constants = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.RUNNING = 'running';
exports.PX = 'px';
exports.DEG = 'deg';
exports.X = 'X';
exports.Y = 'Y';
exports.Z = 'Z';
exports.TRANSLATE = 'translate';
exports.TRANSFORM = 'transform';
exports.transformAngles = strings.csvToList('rotateX,rotateY,rotateZ,rotate');
exports.transformScales = strings.csvToList('scaleX,scaleY,scaleZ,scale');
exports.transformLengths = strings.csvToList('perspective,x,y,z');
exports.transforms = exports.transformAngles.concat(exports.transformScales, exports.transformLengths);
exports.aliases = {
    x: exports.TRANSLATE + exports.X,
    y: exports.TRANSLATE + exports.Y,
    z: exports.TRANSLATE + exports.Z
};
exports.cssLengths = strings.csvToList("backgroundSize,border,borderBottom,borderBottomLeftRadius,borderBottomRightRadius,borderBottomWidth,borderLeft,borderLeftWidth,borderRadius,borderRight,borderRightWidth,borderTop,borderTopLeftRadius,borderTopRightRadius,borderTopWidth,borderWidth,bottom,columnGap,columnRuleWidth,columnWidth,columns,flexBasis,font,fontSize,gridColumnGap,gridGap,gridRowGap,height,left,letterSpacing,lineHeight,margin,marginBottom,marginLeft,marginRight,marginTop,maskSize,maxHeight,maxWidth,minHeight,minWidth,outline,outlineOffset,outlineWidth,padding,paddingBottom,paddingLeft,paddingRight,paddingTop,perspective,right,shapeMargin,tabSize,top,width,wordSpacing");
exports.cssProps = [exports.TRANSFORM].concat(exports.transforms, exports.cssLengths);
});

var functional = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function memoize(func) {
    var cache = [];
    return function () {
        var args = arguments;
        for (var h = 0, hlen = cache.length; h < hlen; h++) {
            var keys = cache[h].args;
            var ilen = args.length;
            if (keys.length !== ilen) {
                continue;
            }
            var matches = 0;
            for (var i = 0; i < ilen; i++) {
                if (keys[i] !== args[i]) {
                    break;
                }
                ++matches;
            }
            if (matches === ilen) {
                return cache[h].value;
            }
        }
        var value = func.apply(constants$1._, args);
        cache.push({ args: args, value: value });
        return value;
    };
}
exports.memoize = memoize;
});

var animate_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



var frameSize = 17;
function animate(effect) {
    var keyframes = effect.keyframes, prop = effect.prop, from = effect.from, to = effect.to, target = effect.target;
    var duration = to - from;
    var getAnimator = functional.memoize(function () {
        var frames = keyframes.map(function (_a) {
            var offset = _a.offset, value = _a.value, easing = _a.easing;
            return (_b = { offset: offset }, _b[prop] = value, _b.easing = easing, _b);
            var _b;
        });
        var a = target.animate(frames, {
            duration: duration,
            fill: 'both'
        });
        a.pause();
        return a;
    });
    return {
        cancel: function () {
            getAnimator().cancel();
        },
        update: function (offset, rate, isPlaying) {
            var animator = getAnimator();
            var time = duration * offset;
            if (math.abs(animator.currentTime - time) > 1) {
                animator.currentTime = time;
            }
            if (isPlaying && animator.playbackRate !== rate) {
                var currentTime = animator.currentTime;
                if (currentTime < 1) {
                    animator.currentTime = 1;
                }
                else if (currentTime >= duration - 1) {
                    animator.currentTime = duration - 1;
                }
                animator.playbackRate = rate;
            }
            var needsToPlay = isPlaying &&
                !(animator.playState === constants.RUNNING || animator.playState === 'finish') &&
                !(rate < 0 && time < frameSize) &&
                !(rate >= 0 && time > duration - frameSize);
            if (needsToPlay) {
                animator.play();
            }
            var needsToPause = !isPlaying && (animator.playState === constants.RUNNING || animator.playState === 'pending');
            if (needsToPause) {
                animator.pause();
            }
        }
    };
}
exports.animate = animate;
});

var lists = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


function includes(items, item) {
    return getIndex(items, item) !== -1;
}
exports.includes = includes;
function getIndex(items, item) {
    return items.indexOf(item);
}
exports.getIndex = getIndex;
function find(indexed, predicate, reverse) {
    var ilen = indexed && indexed.length;
    if (!ilen) {
        return constants$1._;
    }
    if (predicate === constants$1._) {
        return indexed[reverse ? ilen - 1 : 0];
    }
    if (reverse) {
        for (var i = ilen - 1; i > -1; i--) {
            if (predicate(indexed[i])) {
                return indexed[i];
            }
        }
    }
    else {
        for (var i = 0; i < ilen; i++) {
            if (predicate(indexed[i])) {
                return indexed[i];
            }
        }
    }
    return constants$1._;
}
exports.find = find;
function indexOf(items, predicate) {
    for (var i = 0, ilen = items.length; i < ilen; i++) {
        var item = items[i];
        if (predicate(item)) {
            return i;
        }
    }
    return -1;
}
exports.indexOf = indexOf;
function remove(items, item) {
    var index = items.indexOf(item);
    return index !== -1 ? items.splice(index, 1) : constants$1._;
}
exports.remove = remove;
function sortBy(fieldName) {
    return function (a, b) {
        var a1 = a[fieldName];
        var b1 = b[fieldName];
        return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
    };
}
exports.sortBy = sortBy;
function list(indexed) {
    return !inspect.isDefined(indexed) ? [] : inspect.isArrayLike(indexed) ? indexed : [indexed];
}
exports.list = list;
function push(indexed, item) {
    if (item !== constants$1._) {
        Array.prototype.push.call(indexed, item);
    }
    return item;
}
exports.push = push;
function pushDistinct(indexed, item) {
    if (!includes(indexed, item)) {
        push(indexed, item);
    }
    return item;
}
exports.pushDistinct = pushDistinct;
function mapFlatten(items, mapper) {
    var results = [];
    all(items, function (item) {
        var result = mapper(item);
        if (inspect.isArrayLike(result)) {
            all(result, function (item2) { return push(results, item2); });
        }
        else {
            push(results, result);
        }
    });
    return results;
}
exports.mapFlatten = mapFlatten;
function all(items, action) {
    var items2 = list(items);
    for (var i = 0, ilen = items2.length; i < ilen; i++) {
        action(items2[i], i, ilen);
    }
}
exports.all = all;
});

var appendUnits_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



function appendUnits(effects) {
    for (var propName in effects) {
        if (lists.includes(constants.cssLengths, propName)) {
            var prop = effects[propName];
            for (var offset in prop) {
                var obj = prop[offset];
                if (inspect.isDefined(obj)) {
                    var value = obj.value;
                    if (inspect.isNumber(value)) {
                        obj.value += constants.PX;
                    }
                }
            }
        }
    }
}
exports.appendUnits = appendUnits;
});

var parseUnit_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


function parseUnit(val) {
    var output = {
        unit: constants$1._,
        value: constants$1._
    };
    if (!inspect.isDefined(val)) {
        return output;
    }
    if (Number(val)) {
        output.value = +val;
        return output;
    }
    var match = constants$1.measureExpression.exec(val);
    if (match) {
        output.unit = match[2] || constants$1._;
        output.value = match[1] ? parseFloat(match[1]) : constants$1._;
    }
    return output;
}
exports.parseUnit = parseUnit;
});

var transforms = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });





function combineTransforms(target, effects, propToPlugin) {
    var transformNames = target.propNames.filter(function (t) { return lists.includes(constants.transforms, t); });
    if (!transformNames.length) {
        return;
    }
    if (lists.includes(target.propNames, constants.TRANSFORM)) {
        throw new Error('transform + shorthand is not allowed');
    }
    var offsets = [];
    var easings = {};
    lists.all(transformNames, function (name) {
        var effects2 = effects[name];
        if (effects2) {
            lists.all(effects2, function (effect) {
                easings[effect.offset] = effect.easing;
                lists.pushDistinct(offsets, effect.offset);
            });
        }
    });
    offsets.sort();
    var transformEffects = offsets.map(function (offset) {
        var values = {};
        lists.all(transformNames, function (name) {
            var effect = lists.find(effects[name], function (e) { return e.offset === offset; });
            values[name] = effect ? effect.value : constants$1._;
        });
        return {
            offset: offset,
            easing: easings[offset],
            values: values
        };
    });
    var len = transformEffects.length;
    for (var i = len - 1; i > -1; --i) {
        var effect = transformEffects[i];
        for (var transform in effect.values) {
            var value = effect.values[transform];
            if (inspect.isDefined(value)) {
                continue;
            }
            var startingPos = constants$1._;
            for (var j = i - 1; j > -1; j--) {
                if (inspect.isDefined(transformEffects[j].values[transform])) {
                    startingPos = j;
                    break;
                }
            }
            var endingPos = constants$1._;
            for (var k = i + 1; k < len; k++) {
                if (inspect.isDefined(transformEffects[k].values[transform])) {
                    endingPos = k;
                    break;
                }
            }
            var startingPosFound = startingPos !== constants$1._;
            var endingPosFound = endingPos !== constants$1._;
            if (startingPosFound && endingPosFound) {
                var startEffect = transformEffects[startingPos];
                var endEffect = transformEffects[endingPos];
                var startVal = parseUnit_1.parseUnit(startEffect.values[transform]);
                var endVal = parseUnit_1.parseUnit(endEffect.values[transform]);
                for (var g = startingPos + 1; g < endingPos; g++) {
                    var currentOffset = offsets[g];
                    var offsetDelta = (currentOffset - startEffect.offset) / (endEffect.offset - startEffect.offset);
                    var currentValue = startVal.value + (endVal.value - startVal.value) * offsetDelta;
                    var currentValueWithUnit = currentValue + (endVal.unit || startVal.unit || '');
                    var currentKeyframe = transformEffects[g];
                    currentKeyframe.values[transform] = currentValueWithUnit;
                }
            }
            else if (startingPosFound) {
                for (var g = startingPos + 1; g < len; g++) {
                    transformEffects[g].values[transform] = transformEffects[startingPos].values[transform];
                }
            }
        }
    }
    if (transformEffects.length) {
        lists.all(transformNames, function (name) {
            effects[name] = constants$1._;
        });
        var transformEffects2_1 = [];
        lists.all(transformEffects, function (effect) {
            var val = constants$1._;
            for (var prop in effect.values) {
                var unit = parseUnit_1.parseUnit(effect.values[prop]);
                if (unit.value === constants$1._) {
                    continue;
                }
                if (!unit.unit) {
                    unit.unit = lists.includes(constants.transformLengths, prop) ? constants.PX : lists.includes(constants.transformAngles, prop) ? constants.DEG : '';
                }
                val = (val ? val + ' ' : '') + (constants.aliases[prop] || prop) + '(' + unit.value + unit.unit + ')';
            }
            transformEffects2_1.push({
                offset: effect.offset,
                value: val,
                easing: effect.easing,
                interpolate: constants$1._
            });
        });
        effects[constants.TRANSFORM] = transformEffects2_1;
        propToPlugin[constants.TRANSFORM] = 'web';
    }
}
exports.combineTransforms = combineTransforms;
});

var web = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




exports.waapiPlugin = {
    name: 'web',
    animate: animate_1.animate,
    getValue: function (target, key) {
        return getComputedStyle(target)[key];
    },
    onWillAnimate: function (target, effects, propToPlugin) {
        if (inspect.isDOM(target.target)) {
            appendUnits_1.appendUnits(effects);
            transforms.combineTransforms(target, effects, propToPlugin);
        }
    }
};
});

var tools = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var isInitialized;
var scrubberControl;
var scrubberValue;
var play;
var pause;
var reverse;
var timeline;
var pausedForScrubbing = false;
var controlTemplate = "<div id=\"ja-controls\">\n   <div id=\"ja-play\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">\n         <path d=\"M3 22v-20l18 10-18 10z\"/>\n      </svg>\n   </div>\n   <div id=\"ja-pause\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">\n         <path d=\"M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z\"/>\n      </svg>\n   </div>\n   <div id=\"ja-reverse\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">\n         <path d=\"M6 13v4l-6-5 6-5v4h3v2h-3zm9-2v2h3v4l6-5-6-5v4h-3zm-4-6v14h2v-14h-2z\"/>\n      </svg>\n   </div>\n   <input id=\"ja-scrubber\" type=\"range\" min=\"0\" step=\"1\" max=\"1000\" value=\"0\" />\n   <input id=\"ja-seek\" type=\"number\" placeholder=\"0ms\" />\n   <div>\n      <button data-ja-rate value=\".1\">10%</button>\n      <button data-ja-rate value=\".5\">50%</button>\n      <button data-ja-rate value=\"1\" class=\"active\">100%</button>\n   </div>\n</div>";
var colorFillLower = '#2a6495';
var colorFillUpper = '#7AC7C4';
var boxShadow1 = '1px 1px 1px #000000, 0px 0px 1px #0d0d0d';
var thumbHeight = '24px';
var thumbWidth = '4px';
var trackHeight = '4px';
var thumbColor = '#9ba6c0';
var border = '0.2px solid #010101';
var stylesTemplate = "<style style=\"display:none\">\n#ja-controls { \n   position: fixed;\n   bottom: 10px;\n   right: 10px;\n   background-color: rgba(0, 0, 0, .8);\n   border: solid thin rgba(255, 255, 255, .4);\n   border-radius: 5px;\n   padding: 0;\n}\n\n#ja-controls > * { \n   vertical-align: middle;\n   display: inline-block;\n   padding: 2px 5px;\n}\n\n#ja-controls button[data-ja-rate] {\n   background: none;\n   border: solid thin rgb(175, 173, 173);\n   font-size: .8em;\n   border-radius: 4px;\n   cursor: pointer;\n}\n\n#ja-controls button[data-ja-rate]:hover {\n   background-color: black;\n}\n\n#ja-controls button[data-ja-rate].active {\n   background-color: #4f5d7d; \n}\n#ja-controls path {\n    fill: currentColor;\n}\n#ja-play, #ja-pause, #ja-reverse {\n   height: 1em;\n   width: 1em;\n   cursor: pointer;\n}\n#ja-seek {\n   width: 50px;\n   text-align: right; \n   font-size: .8em;\n   color: white;\n   background-color: transparent;\n   border: none;\n   -moz-appearance: textfield;\n} \n\n#ja-seek::-webkit-inner-spin-button, \n#ja-seek::-webkit-outer-spin-button { \n  -webkit-appearance: none; \n  margin: 0; \n}\n\n#ja-controls * { \n   font-family: Arial;\n   font-size: 12pt;\n   color: white; \n}\n#ja-controls > button[data-ja-rate] { \n   font-size: .8em;\n}\n\n#ja-controls > input[type=range] {\n  -webkit-appearance: none;\n  padding: 0;\n  height: 30px;\n  background-color: transparent;\n}\n#ja-controls > input[type=range]:focus {\n  outline: none;\n}\n#ja-controls > input[type=range]::-webkit-slider-runnable-track {\n  width: 100%;\n  height: " + trackHeight + ";\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow: " + boxShadow1 + ";\n  background: " + colorFillUpper + ";\n  border-radius: 1.3px;\n  border: " + border + ";\n}\n#ja-controls > input[type=range]::-webkit-slider-thumb {\n  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;\n  border: " + border + ";\n  height: " + thumbHeight + ";\n  width: " + thumbWidth + ";\n  border-radius: 3px;\n  background: " + thumbColor + ";\n  cursor: pointer;\n  -webkit-appearance: none;\n  margin-top: -10px;\n}\n#ja-controls > input[type=range]:focus::-webkit-slider-runnable-track {\n  background: " + colorFillUpper + ";\n}\n#ja-controls > input[type=range]::-moz-range-track {\n  width: 100%;\n  height: " + trackHeight + ";\n  cursor: pointer;\n  animate: 0.2s;\n  box-shadow:  " + boxShadow1 + ";\n  background: " + colorFillUpper + ";\n  border-radius: 1.3px;\n  border: " + border + ";\n}\n#ja-controls > input[type=range]::-moz-range-thumb {\n  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;\n  border: " + border + ";\n  height: " + thumbHeight + ";\n  width: " + thumbWidth + ";\n  border-radius: 3px;\n  background: " + thumbColor + ";\n  cursor: pointer;\n}\n#ja-controls > input[type=range]::-ms-track {\n  width: 100%;\n  height: " + trackHeight + ";\n  cursor: pointer; \n  background: transparent;\n  border-color: transparent;\n  border-width: 16px 0;\n  color: transparent;\n}\n#ja-controls > input[type=range]::-ms-fill-lower {\n  background: " + colorFillLower + ";\n  border: " + border + ";\n  border-radius: 2.6px;\n  box-shadow: " + boxShadow1 + ";\n}\n#ja-controls > input[type=range]::-ms-fill-upper {\n  background: " + colorFillUpper + ";\n  border: " + border + ";\n  border-radius: 2.6px;\n  box-shadow:  " + boxShadow1 + ";\n}\n#ja-controls > input[type=range]::-ms-thumb {\n  box-shadow: " + boxShadow1 + ";\n  border: " + border + ";\n  height: " + thumbHeight + ";\n  width: " + thumbWidth + ";\n  margin-top: 1px;\n  border-radius: 3px;\n  background: #ffffff;\n  cursor: pointer;\n}\n#ja-controls > input[type=range]:focus::-ms-fill-lower {\n  background: " + colorFillUpper + ";\n}\n#ja-controls > input[type=range]:focus::-ms-fill-upper {\n  background: " + colorFillUpper + ";\n}\n\n</style>";
function id(identifier) {
    return document.getElementById(identifier);
}
function on(element, event, listener) {
    element.addEventListener(event, listener);
}
function onValueChanged(value) {
    value = Math.floor(+value);
    scrubberValue.value = value + '';
    scrubberControl.value = value + '';
}
function init() {
    var $wrapper = document.createElement('div');
    $wrapper.id = 'ja-controls';
    $wrapper.innerHTML = stylesTemplate + controlTemplate;
    document.body.appendChild($wrapper);
    scrubberControl = id('ja-scrubber');
    scrubberValue = id('ja-seek');
    play = id('ja-play');
    pause = id('ja-pause');
    reverse = id('ja-reverse');
    scrubberValue.value = '0';
    var scrubberChanged = function (evt) {
        var value = +evt.currentTarget.value;
        timeline.currentTime = value;
        onValueChanged(value);
    };
    on(scrubberControl, 'input', scrubberChanged);
    on(scrubberControl, 'change', scrubberChanged);
    on(scrubberValue, 'mousedown', function () {
        if (timeline) {
            timeline.pause();
        }
    });
    on(scrubberControl, 'mousedown', function () {
        if (timeline) {
            if (timeline.state === 3) {
                pausedForScrubbing = true;
            }
            timeline.pause();
        }
    });
    on(scrubberControl, 'mouseup', function () {
        if (timeline && pausedForScrubbing) {
            pausedForScrubbing = false;
            timeline.play();
        }
    });
    on(scrubberValue, 'input', function (evt) {
        var value = +evt.currentTarget.value;
        timeline.currentTime = value;
        onValueChanged(value);
    });
    on(play, 'click', function () {
        if (timeline) {
            timeline.play();
        }
    });
    on(pause, 'click', function () {
        if (timeline) {
            timeline.pause();
        }
    });
    on(reverse, 'click', function () {
        if (timeline) {
            timeline.reverse();
        }
    });
    var rates = [].slice.call(document.querySelectorAll('#ja-controls [data-ja-rate]'));
    rates.forEach(function (rate) {
        on(rate, 'click', function () {
            rates.forEach(function (rate2) { return rate2.classList.remove('active'); });
            rate.classList.add('active');
            if (timeline) {
                var sign = timeline.playbackRate < 0 ? -1 : 1;
                timeline.playbackRate = +rate.value * sign;
            }
        });
    });
}
function player(timeline2) {
    if (!isInitialized) {
        init();
        isInitialized = true;
    }
    if (timeline) {
        timeline.off('update', onValueChanged);
    }
    scrubberControl.setAttribute('max', String(timeline2.duration));
    scrubberControl.value = String(timeline2.currentTime);
    timeline2.on('update', onValueChanged);
    timeline2.on('config', function () {
        scrubberControl.setAttribute('max', String(timeline2.duration));
    });
    timeline = timeline2;
}
exports.player = player;
});

var qrcode_1 = createCommonjsModule(function (module, exports) {
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;
      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += ' width="' + size + 'px"';
      qrSvg += ' height="' + size + 'px"';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet">';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += alt;
        img += '"';
      }
      img += '/>';

      return img;
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      }
      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  }
  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) ; else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));
});

const distanceBetween = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
var HorizontalFocalPoint;
(function (HorizontalFocalPoint) {
  HorizontalFocalPoint[HorizontalFocalPoint["Left"] = 0] = "Left";
  HorizontalFocalPoint[HorizontalFocalPoint["Middle"] = 1] = "Middle";
  HorizontalFocalPoint[HorizontalFocalPoint["Right"] = 2] = "Right";
})(HorizontalFocalPoint || (HorizontalFocalPoint = {}));
var VerticalFocalPoint;
(function (VerticalFocalPoint) {
  VerticalFocalPoint[VerticalFocalPoint["Top"] = 0] = "Top";
  VerticalFocalPoint[VerticalFocalPoint["Center"] = 1] = "Center";
  VerticalFocalPoint[VerticalFocalPoint["Bottom"] = 2] = "Bottom";
})(VerticalFocalPoint || (VerticalFocalPoint = {}));
const translatePoint = (edgeLength) => {
  return (x, y, hFocus, vFocus) => {
    return {
      adjustedX: hFocus === HorizontalFocalPoint.Left
        ? x
        : hFocus === HorizontalFocalPoint.Right
          ? x + edgeLength
          : x + edgeLength / 2,
      adjustedY: vFocus === VerticalFocalPoint.Top
        ? y
        : vFocus === VerticalFocalPoint.Bottom
          ? y + edgeLength
          : y + edgeLength / 2,
    };
  };
};
const adjustRing = translatePoint(7);
const adjustCenter = translatePoint(3);
function focalPoint(value, center, less, equal, greater) {
  return value < center ? less : value > center ? greater : equal;
}
const innermostPoint = (x, y, count, entity) => {
  const center = count / 2;
  const horizontalFocus = focalPoint(x, center, HorizontalFocalPoint.Right, HorizontalFocalPoint.Middle, HorizontalFocalPoint.Left);
  const verticalFocus = focalPoint(y, center, VerticalFocalPoint.Bottom, VerticalFocalPoint.Center, VerticalFocalPoint.Top);
  return entity === QRCodeEntity.PositionCenter
    ? adjustCenter(x, y, horizontalFocus, verticalFocus)
    : entity === QRCodeEntity.PositionRing
      ? adjustRing(x, y, horizontalFocus, verticalFocus)
      : { adjustedX: x, adjustedY: y };
};
/**
 * Derived from https://github.com/sktt/springish-css/
 */
const underdampedHarmonicOscillationMaximums = (amplitude, stiffness, damping) => {
  const MIN_Y = 0.01;
  const offset = 0;
  const dampingRatio = stiffness - damping ** 2;
  if (dampingRatio < 0)
    throw new Error('This method only supports underdamped oscillation.');
  const omega = Math.sqrt(dampingRatio);
  const amp = (t) => amplitude * Math.pow(Math.E, -damping * t);
  const y = (t) => amp(t) * Math.cos(omega * t + offset);
  const yMax = (p) => (Math.atan(-damping / omega) + p * Math.PI - offset) / omega;
  const maximums = [];
  maximums.push({ time: 0, amplitude: y(0) });
  for (var a = 0; Math.abs(maximums[maximums.length - 1].amplitude) > MIN_Y; a++) {
    if (yMax(a) >= 0) {
      maximums.push({ time: yMax(a), amplitude: y(yMax(a)) });
    }
  }
  return maximums;
};
const scaleOscillationsToOffset = (beginningOffset, endingOffset, maximums) => {
  const availableTime = endingOffset - beginningOffset;
  const unscaledEndTime = maximums[maximums.length - 1].time;
  const scalingFactor = availableTime / unscaledEndTime;
  return maximums.map(({ time, amplitude }) => ({
    offset: beginningOffset + time * scalingFactor,
    value: amplitude,
  }));
};
const applyToValues = (keyframes, operation) => keyframes.map((keyframe) => ({
  offset: keyframe.offset,
  value: operation(keyframe.value),
}));

var QRCodeEntity;
(function (QRCodeEntity) {
  QRCodeEntity["Module"] = "module";
  QRCodeEntity["PositionRing"] = "position-ring";
  QRCodeEntity["PositionCenter"] = "position-center";
  QRCodeEntity["Icon"] = "icon";
})(QRCodeEntity || (QRCodeEntity = {}));
var AnimationPreset;
(function (AnimationPreset) {
  AnimationPreset["FadeInTopDown"] = "FadeInTopDown";
  AnimationPreset["FadeInCenterOut"] = "FadeInCenterOut";
  AnimationPreset["RadialRipple"] = "RadialRipple";
  AnimationPreset["RadialRippleIn"] = "RadialRippleIn";
  AnimationPreset["MaterializeIn"] = "MaterializeIn";
})(AnimationPreset || (AnimationPreset = {}));
const FadeInTopDown = (targets, _x, y, _count, _entity) => {
  return {
    targets,
    from: y * 20,
    duration: 300,
    web: {
      opacity: [0, 1],
    },
  };
};
const FadeInCenterOut = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distance = distanceBetween(adjustedX, adjustedY, center, center);
  return {
    targets,
    from: distance * 20,
    duration: 200,
    web: {
      opacity: [0, 1],
    },
  };
};
const MaterializeIn = (targets, _x, _y, _count, entity) => ({
  targets,
  from: entity === QRCodeEntity.Module ? Math.random() * 200 : 200,
  duration: 200,
  web: {
    opacity: [0, 1],
  },
});
const beginOscillation = 0.2;
const endOscillation = 1;
const amplitude = 5;
const stiffness = 50;
const damping = 3;
const radialRippleMaximums = underdampedHarmonicOscillationMaximums(amplitude, stiffness, damping);
const radialRippleOscillationKeyframes = scaleOscillationsToOffset(beginOscillation, endOscillation, radialRippleMaximums);
const RadialRipple = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distanceFromCenter = distanceBetween(adjustedX, adjustedY, center, center);
  const waveResistance = 7;
  return {
    targets,
    from: distanceFromCenter * waveResistance,
    easing: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)',
    duration: 1000,
    web: {
      scale: [
        ...(entity === QRCodeEntity.Icon
          ? [
            { offset: 0, value: 1 },
            { offset: 0.1, value: 0.7 },
            { offset: 0.2, value: 1 },
          ]
          : [{ offset: 0, value: 1 }]),
        ...applyToValues(radialRippleOscillationKeyframes, (x) => 1 + (x / amplitude) * 0.1),
        1,
      ],
    },
  };
};
const RadialRippleIn = (targets, x, y, count, entity) => {
  const { adjustedX, adjustedY } = innermostPoint(x, y, count, entity);
  const center = count / 2;
  const distanceFromCenter = distanceBetween(adjustedX, adjustedY, center, center);
  const waveResistance = 7;
  return {
    targets,
    from: distanceFromCenter * waveResistance,
    easing: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)',
    duration: 1000,
    web: {
      scale: [
        ...(entity === QRCodeEntity.Icon
          ? [
            { offset: 0, value: 1 },
            { offset: 0.1, value: 0.7 },
            { offset: 0.2, value: 1 },
          ]
          : [{ offset: 0, value: 0 }]),
        ...applyToValues(radialRippleOscillationKeyframes, (x) => 1 + (x / amplitude) * 0.1),
        1,
      ],
      opacity: [
        { offset: 0, value: 0 },
        { offset: 0.05, value: 1 },
      ],
    },
  };
};
const getAnimationPreset = (name) => {
  switch (name) {
    case AnimationPreset.FadeInTopDown:
      return FadeInTopDown;
    case AnimationPreset.FadeInCenterOut:
      return FadeInCenterOut;
    case AnimationPreset.RadialRipple:
      return RadialRipple;
    case AnimationPreset.RadialRippleIn:
      return RadialRippleIn;
    case AnimationPreset.MaterializeIn:
      return MaterializeIn;
    default:
      throw new Error(`${name} is not a valid AnimationPreset.`);
  }
};

const qrCodeCss = ":host{display:block;contain:content}#qr-container{position:relative}#icon-container{position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center}";

addPlugin(web.waapiPlugin);
const BpQRCode = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.codeRendered = index.createEvent(this, "codeRendered", 7);
    this.contents = '';
    this.protocol = '';
    this.moduleColor = '#000';
    this.positionRingColor = '#000';
    this.positionCenterColor = '#000';
    this.maskXToYRatio = 1;
    this.squares = false;
    this.data = undefined;
    this.moduleCount = undefined;
  }
  /**
   * The first update must run after load to query the created shadowRoot for
   * slotted nodes.
   */
  componentDidLoad() {
    this.updateQR();
  }
  componentDidUpdate() {
    this.codeRendered.emit();
  }
  updateQR() {
    /**
     * E.g. Firefox, as of Firefox 61
     */
    const isUsingWebComponentPolyfill = this.qrCodeElement === this.qrCodeElement.shadowRoot;
    const realSlot = this.qrCodeElement.shadowRoot.querySelector('slot');
    const hasSlot = isUsingWebComponentPolyfill
      ? this.qrCodeElement.querySelector('[slot]')
        ? true
        : false
      : realSlot
        ? typeof realSlot.assignedNodes === 'function'
          ? realSlot.assignedNodes().length > 0
          : realSlot.childNodes.length > 0 // Fallback for Jest jsdom environment
        : false;
    this.data = this.generateQRCodeSVG(this.contents, hasSlot);
  }
  async animateQRCode(animation) {
    this.executeAnimation(typeof animation === 'string' ? getAnimationPreset(animation) : animation);
  }
  async getModuleCount() {
    return this.moduleCount;
  }
  executeAnimation(animation) {
    const modules = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.module'));
    const rings = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.position-ring'));
    const centers = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('.position-center'));
    const icons = Array.from(this.qrCodeElement.shadowRoot.querySelectorAll('#icon-wrapper'));
    const setEntityType = (array, entity) => {
      return array.map((element) => {
        return {
          element,
          entityType: entity,
        };
      });
    };
    const animationAdditions = [
      ...setEntityType(modules, QRCodeEntity.Module),
      ...setEntityType(rings, QRCodeEntity.PositionRing),
      ...setEntityType(centers, QRCodeEntity.PositionCenter),
      ...setEntityType(icons, QRCodeEntity.Icon),
    ]
      .map(({ element, entityType }) => {
      return {
        element,
        // SVGElement.dataset is part of the SVG 2.0 draft
        // TODO: requires a polyfill for Edge:
        // https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/dataset
        positionX: parseInt(element.dataset.column, 10),
        positionY: parseInt(element.dataset.row, 10),
        entityType: entityType,
      };
    })
      .map((entityInfo) => animation(entityInfo.element, entityInfo.positionX, entityInfo.positionY, this.moduleCount, entityInfo.entityType));
    const timeline = animate(animationAdditions);
    // Comment out below to build for production:
    tools.player(timeline);
    timeline.play();
  }
  generateQRCodeSVG(contents, maskCenter) {
    const qr = qrcode_1(
    /* Auto-detect QR Code version to use */ 0, 
    /* Highest error correction level */ 'H');
    qr.addData(contents);
    qr.make();
    const margin = 4;
    this.moduleCount = qr.getModuleCount();
    const pixelSize = this.moduleCount + margin * 2;
    const coordinateShift = pixelSize / 2;
    return `
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="${0 - coordinateShift} ${0 - coordinateShift} ${pixelSize} ${pixelSize}"
        preserveAspectRatio="xMinYMin meet">
    <rect
        width="100%"
        height="100%"
        fill="white"
        fill-opacity="0"
        cx="${-coordinateShift}"
        cy="${-coordinateShift}"/>
    ${this.squares
      ? void 0
      : renderQRPositionDetectionPatterns(this.moduleCount, margin, this.positionRingColor, this.positionCenterColor, coordinateShift)}
    ${renderQRModulesSVG(qr, this.moduleCount, margin, maskCenter, this.maskXToYRatio, this.squares, this.moduleColor, coordinateShift)}
    </svg>`;
    function renderQRPositionDetectionPatterns(count, margin, ringFill, centerFill, coordinateShift) {
      return `
      ${renderQRPositionDetectionPattern(margin, margin, margin, ringFill, centerFill, coordinateShift)}
      ${renderQRPositionDetectionPattern(count - 7 + margin, margin, margin, ringFill, centerFill, coordinateShift)}
      ${renderQRPositionDetectionPattern(margin, count - 7 + margin, margin, ringFill, centerFill, coordinateShift)}
      `;
    }
    function renderQRPositionDetectionPattern(x, y, margin, ringFill, centerFill, coordinateShift) {
      return `
      <path
        class="position-ring"
        fill="${ringFill}"
        data-column="${x - margin}" 
        data-row="${y - margin}" 
        d="M${x - coordinateShift} ${y - 0.5 - coordinateShift}h6s.5 0 .5 .5v6s0 .5-.5 .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25 .25h4.5s.25 0 .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"/>
      <path
        class="position-center"
        fill="${centerFill}"
        data-column="${x - margin + 2}"
        data-row="${y - margin + 2}"
        d="M${x + 2 - coordinateShift} ${y + 1.5 - coordinateShift}h2s.5 0 .5 .5v2s0 .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"/>
      `;
    }
    function renderQRModulesSVG(qr, count, margin, maskCenter, maskXToYRatio, squares, moduleFill, coordinateShift) {
      let svg = '';
      for (let column = 0; column < count; column += 1) {
        const positionX = column + margin;
        for (let row = 0; row < count; row += 1) {
          if (qr.isDark(column, row) &&
            (squares ||
              (!isPositioningElement(row, column, count) &&
                !isRemovableCenter(row, column, count, maskCenter, maskXToYRatio)))) {
            const positionY = row + margin;
            svg += squares
              ? `
            <rect x="${positionX - 0.5 - coordinateShift}" y="${positionY - 0.5 - coordinateShift}" width="1" height="1" />
            `
              : `
            <circle
                class="module"
                fill="${moduleFill}"
                cx="${positionX - coordinateShift}"
                cy="${positionY - coordinateShift}"
                data-column="${column}"
                data-row="${row}"
                r="0.5"/>`;
          }
        }
      }
      return svg;
    }
    function isPositioningElement(row, column, count) {
      const elemWidth = 7;
      return row <= elemWidth
        ? column <= elemWidth || column >= count - elemWidth
        : column <= elemWidth
          ? row >= count - elemWidth
          : false;
    }
    /**
     * For ErrorCorrectionLevel 'H', up to 30% of the code can be corrected. To
     * be safe, we limit damage to 10%.
     */
    function isRemovableCenter(row, column, count, maskCenter, maskXToYRatio) {
      if (!maskCenter)
        return false;
      const center = count / 2;
      const safelyRemovableHalf = Math.floor((count * Math.sqrt(0.1)) / 2);
      const safelyRemovableHalfX = safelyRemovableHalf * maskXToYRatio;
      const safelyRemovableHalfY = safelyRemovableHalf / maskXToYRatio;
      const safelyRemovableStartX = center - safelyRemovableHalfX;
      const safelyRemovableEndX = center + safelyRemovableHalfX;
      const safelyRemovableStartY = center - safelyRemovableHalfY;
      const safelyRemovableEndY = center + safelyRemovableHalfY;
      return (row >= safelyRemovableStartY &&
        row <= safelyRemovableEndY &&
        column >= safelyRemovableStartX &&
        column <= safelyRemovableEndX);
    }
  }
  render() {
    return (index.h("div", { id: "qr-container" }, index.h("div", { id: "icon-container", style: this.squares ? { display: 'none', visibility: 'hidden' } : {} }, index.h("div", { id: "icon-wrapper", style: { width: `${18 * this.maskXToYRatio}%` }, "data-column": this.moduleCount / 2, "data-row": this.moduleCount / 2 }, index.h("slot", { name: "icon" }))), index.h("div", { innerHTML: this.data })));
  }
  get qrCodeElement() { return index.getElement(this); }
  static get watchers() { return {
    "contents": ["updateQR"],
    "protocol": ["updateQR"],
    "moduleColor": ["updateQR"],
    "positionRingColor": ["updateQR"],
    "positionCenterColor": ["updateQR"],
    "maskXToYRatio": ["updateQR"],
    "squares": ["updateQR"]
  }; }
};
BpQRCode.style = qrCodeCss;

exports.qr_code = BpQRCode;
