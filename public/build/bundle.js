
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/ResumeZG.svelte generated by Svelte v3.49.0 */

    const file$3 = "src/components/ResumeZG.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:8) {#if resumeData.jobs }
    function create_if_block_1$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Work Experience";
    			add_location(h2, file$3, 12, 8, 278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(12:8) {#if resumeData.jobs }",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each resumeData.jobs as job}
    function create_each_block_1$1(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*job*/ ctx[4].title + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = /*job*/ ctx[4].organization + "";
    	let t2;
    	let t3;
    	let t4_value = /*job*/ ctx[4].location + "";
    	let t4;
    	let t5;
    	let span1;
    	let t6_value = /*job*/ ctx[4].duration + "";
    	let t6;
    	let t7;
    	let p;
    	let t8_value = /*job*/ ctx[4].description + "";
    	let t8;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = text(" - ");
    			t4 = text(t4_value);
    			t5 = space();
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			p = element("p");
    			t8 = text(t8_value);
    			add_location(h3, file$3, 16, 12, 382);
    			add_location(span0, file$3, 17, 12, 415);
    			add_location(span1, file$3, 18, 12, 476);
    			add_location(p, file$3, 19, 12, 516);
    			add_location(div, file$3, 15, 8, 364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(span0, t4);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);
    			append_dev(div, t7);
    			append_dev(div, p);
    			append_dev(p, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*job*/ ctx[4].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resumeData*/ 1 && t2_value !== (t2_value = /*job*/ ctx[4].organization + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*resumeData*/ 1 && t4_value !== (t4_value = /*job*/ ctx[4].location + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resumeData*/ 1 && t6_value !== (t6_value = /*job*/ ctx[4].duration + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*resumeData*/ 1 && t8_value !== (t8_value = /*job*/ ctx[4].description + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(15:8) {#each resumeData.jobs as job}",
    		ctx
    	});

    	return block;
    }

    // (23:8) {#if resumeData.education }
    function create_if_block$2(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Education History";
    			add_location(h2, file$3, 23, 8, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:8) {#if resumeData.education }",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#each resumeData.education as institution}
    function create_each_block$1(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*institution*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let span0;
    	let t2_value = /*institution*/ ctx[1].location + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4_value = /*institution*/ ctx[1].degree + "";
    	let t4;
    	let t5;
    	let span2;
    	let t6_value = /*institution*/ ctx[1].year + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span2 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			add_location(h3, file$3, 27, 12, 735);
    			add_location(span0, file$3, 28, 12, 775);
    			add_location(span1, file$3, 29, 12, 823);
    			add_location(span2, file$3, 30, 12, 869);
    			add_location(div, file$3, 26, 8, 717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, span0);
    			append_dev(span0, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, t4);
    			append_dev(div, t5);
    			append_dev(div, span2);
    			append_dev(span2, t6);
    			append_dev(div, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*institution*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resumeData*/ 1 && t2_value !== (t2_value = /*institution*/ ctx[1].location + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*resumeData*/ 1 && t4_value !== (t4_value = /*institution*/ ctx[1].degree + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resumeData*/ 1 && t6_value !== (t6_value = /*institution*/ ctx[1].year + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:8) {#each resumeData.education as institution}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let article;
    	let header;
    	let h1;
    	let t0_value = /*resumeData*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*resumeData*/ ctx[0].email + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4_value = /*resumeData*/ ctx[0].phone + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6_value = /*resumeData*/ ctx[0].website + "";
    	let t6;
    	let t7;
    	let main;
    	let t8;
    	let t9;
    	let t10;
    	let if_block0 = /*resumeData*/ ctx[0].jobs && create_if_block_1$2(ctx);
    	let each_value_1 = /*resumeData*/ ctx[0].jobs;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block1 = /*resumeData*/ ctx[0].education && create_if_block$2(ctx);
    	let each_value = /*resumeData*/ ctx[0].education;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t8 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			if (if_block1) if_block1.c();
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$3, 5, 8, 83);
    			attr_dev(p0, "class", "svelte-u8ca8t");
    			add_location(p0, file$3, 6, 8, 118);
    			attr_dev(p1, "class", "svelte-u8ca8t");
    			add_location(p1, file$3, 7, 8, 152);
    			attr_dev(p2, "class", "svelte-u8ca8t");
    			add_location(p2, file$3, 8, 8, 186);
    			attr_dev(header, "class", "svelte-u8ca8t");
    			add_location(header, file$3, 4, 4, 66);
    			add_location(main, file$3, 10, 4, 232);
    			attr_dev(article, "class", "svelte-u8ca8t");
    			add_location(article, file$3, 3, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			append_dev(header, p0);
    			append_dev(p0, t2);
    			append_dev(header, t3);
    			append_dev(header, p1);
    			append_dev(p1, t4);
    			append_dev(header, t5);
    			append_dev(header, p2);
    			append_dev(p2, t6);
    			append_dev(article, t7);
    			append_dev(article, main);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t8);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(main, null);
    			}

    			append_dev(main, t9);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*resumeData*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resumeData*/ 1 && t2_value !== (t2_value = /*resumeData*/ ctx[0].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*resumeData*/ 1 && t4_value !== (t4_value = /*resumeData*/ ctx[0].phone + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resumeData*/ 1 && t6_value !== (t6_value = /*resumeData*/ ctx[0].website + "")) set_data_dev(t6, t6_value);

    			if (/*resumeData*/ ctx[0].jobs) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(main, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*resumeData*/ 1) {
    				each_value_1 = /*resumeData*/ ctx[0].jobs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(main, t9);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (/*resumeData*/ ctx[0].education) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(main, t10);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*resumeData*/ 1) {
    				each_value = /*resumeData*/ ctx[0].education;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks_1, detaching);
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResumeZG', slots, []);
    	let { resumeData } = $$props;
    	const writable_props = ['resumeData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResumeZG> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resumeData' in $$props) $$invalidate(0, resumeData = $$props.resumeData);
    	};

    	$$self.$capture_state = () => ({ resumeData });

    	$$self.$inject_state = $$props => {
    		if ('resumeData' in $$props) $$invalidate(0, resumeData = $$props.resumeData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resumeData];
    }

    class ResumeZG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { resumeData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResumeZG",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resumeData*/ ctx[0] === undefined && !('resumeData' in props)) {
    			console.warn("<ResumeZG> was created without expected prop 'resumeData'");
    		}
    	}

    	get resumeData() {
    		throw new Error("<ResumeZG>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeData(value) {
    		throw new Error("<ResumeZG>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/BaseResume.svelte generated by Svelte v3.49.0 */

    const file$2 = "src/components/BaseResume.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (5:4) {#if resumeData}
    function create_if_block$1(ctx) {
    	let header;
    	let h1;
    	let t0_value = /*resumeData*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let t3;
    	let t4;
    	let main;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let if_block0 = /*resumeData*/ ctx[0].email && create_if_block_6(ctx);
    	let if_block1 = /*resumeData*/ ctx[0].phone && create_if_block_5(ctx);
    	let if_block2 = /*resumeData*/ ctx[0].website && create_if_block_4(ctx);
    	let if_block3 = /*resumeData*/ ctx[0].bio && create_if_block_3(ctx);
    	let if_block4 = /*resumeData*/ ctx[0].jobs && create_if_block_2(ctx);
    	let each_value_1 = /*resumeData*/ ctx[0].jobs;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block5 = /*resumeData*/ ctx[0].education && create_if_block_1$1(ctx);
    	let each_value = /*resumeData*/ ctx[0].education;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			main = element("main");
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			if (if_block5) if_block5.c();
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-p67jbp");
    			add_location(h1, file$2, 6, 8, 116);
    			attr_dev(div, "class", "abs-tr svelte-p67jbp");
    			add_location(div, file$2, 7, 8, 151);
    			attr_dev(header, "class", "rel svelte-p67jbp");
    			add_location(header, file$2, 5, 4, 87);
    			add_location(main, file$2, 19, 4, 482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			append_dev(header, div);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t3);
    			if (if_block2) if_block2.m(div, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block3) if_block3.m(main, null);
    			append_dev(main, t5);
    			if (if_block4) if_block4.m(main, null);
    			append_dev(main, t6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(main, null);
    			}

    			append_dev(main, t7);
    			if (if_block5) if_block5.m(main, null);
    			append_dev(main, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*resumeData*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (/*resumeData*/ ctx[0].email) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*resumeData*/ ctx[0].phone) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(div, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*resumeData*/ ctx[0].website) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*resumeData*/ ctx[0].bio) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3(ctx);
    					if_block3.c();
    					if_block3.m(main, t5);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*resumeData*/ ctx[0].jobs) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_2(ctx);
    					if_block4.c();
    					if_block4.m(main, t6);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*resumeData*/ 1) {
    				each_value_1 = /*resumeData*/ ctx[0].jobs;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(main, t7);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (/*resumeData*/ ctx[0].education) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$1(ctx);
    					if_block5.c();
    					if_block5.m(main, t8);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*resumeData*/ 1) {
    				each_value = /*resumeData*/ ctx[0].education;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(main);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			destroy_each(each_blocks_1, detaching);
    			if (if_block5) if_block5.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(5:4) {#if resumeData}",
    		ctx
    	});

    	return block;
    }

    // (9:12) {#if resumeData.email}
    function create_if_block_6(ctx) {
    	let p;
    	let t_value = /*resumeData*/ ctx[0].email + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-p67jbp");
    			add_location(p, file$2, 9, 12, 219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t_value !== (t_value = /*resumeData*/ ctx[0].email + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(9:12) {#if resumeData.email}",
    		ctx
    	});

    	return block;
    }

    // (12:12) {#if resumeData.phone}
    function create_if_block_5(ctx) {
    	let p;
    	let t_value = /*resumeData*/ ctx[0].phone + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-p67jbp");
    			add_location(p, file$2, 12, 12, 310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t_value !== (t_value = /*resumeData*/ ctx[0].phone + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(12:12) {#if resumeData.phone}",
    		ctx
    	});

    	return block;
    }

    // (15:12) {#if resumeData.website}
    function create_if_block_4(ctx) {
    	let p;
    	let t_value = /*resumeData*/ ctx[0].website + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-p67jbp");
    			add_location(p, file$2, 15, 12, 403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t_value !== (t_value = /*resumeData*/ ctx[0].website + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(15:12) {#if resumeData.website}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#if resumeData.bio }
    function create_if_block_3(ctx) {
    	let h2;
    	let t1;
    	let hr;
    	let t2;
    	let p;
    	let t3_value = /*resumeData*/ ctx[0].bio + "";
    	let t3;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Bio";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			attr_dev(h2, "class", "svelte-p67jbp");
    			add_location(h2, file$2, 21, 8, 527);
    			attr_dev(hr, "class", "svelte-p67jbp");
    			add_location(hr, file$2, 22, 8, 548);
    			attr_dev(p, "class", "description svelte-p67jbp");
    			add_location(p, file$2, 23, 8, 563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t3_value !== (t3_value = /*resumeData*/ ctx[0].bio + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(21:8) {#if resumeData.bio }",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if resumeData.jobs }
    function create_if_block_2(ctx) {
    	let h2;
    	let t1;
    	let hr;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Work Experience";
    			t1 = space();
    			hr = element("hr");
    			attr_dev(h2, "class", "svelte-p67jbp");
    			add_location(h2, file$2, 26, 8, 660);
    			attr_dev(hr, "class", "svelte-p67jbp");
    			add_location(hr, file$2, 27, 8, 693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:8) {#if resumeData.jobs }",
    		ctx
    	});

    	return block;
    }

    // (30:8) {#each resumeData.jobs as job}
    function create_each_block_1(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*job*/ ctx[4].title + "";
    	let t0;
    	let t1;
    	let h4;
    	let t2_value = /*job*/ ctx[4].organization + "";
    	let t2;
    	let t3;
    	let span0;
    	let t4_value = /*job*/ ctx[4].location + "";
    	let t4;
    	let t5;
    	let span1;
    	let t6_value = /*job*/ ctx[4].duration + "";
    	let t6;
    	let t7;
    	let p;
    	let t8_value = /*job*/ ctx[4].description + "";
    	let t8;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = text(" - ");
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			p = element("p");
    			t8 = text(t8_value);
    			attr_dev(h3, "class", "svelte-p67jbp");
    			add_location(h3, file$2, 31, 12, 791);
    			attr_dev(h4, "class", "svelte-p67jbp");
    			add_location(h4, file$2, 32, 12, 824);
    			add_location(span0, file$2, 32, 42, 854);
    			attr_dev(span1, "class", "abs-tr svelte-p67jbp");
    			add_location(span1, file$2, 33, 12, 894);
    			attr_dev(p, "class", "description description-work svelte-p67jbp");
    			add_location(p, file$2, 34, 12, 949);
    			attr_dev(div, "class", "rel svelte-p67jbp");
    			add_location(div, file$2, 30, 8, 761);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, h4);
    			append_dev(h4, t2);
    			append_dev(div, t3);
    			append_dev(div, span0);
    			append_dev(span0, t4);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);
    			append_dev(div, t7);
    			append_dev(div, p);
    			append_dev(p, t8);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*job*/ ctx[4].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resumeData*/ 1 && t2_value !== (t2_value = /*job*/ ctx[4].organization + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*resumeData*/ 1 && t4_value !== (t4_value = /*job*/ ctx[4].location + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resumeData*/ 1 && t6_value !== (t6_value = /*job*/ ctx[4].duration + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*resumeData*/ 1 && t8_value !== (t8_value = /*job*/ ctx[4].description + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(30:8) {#each resumeData.jobs as job}",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if resumeData.education }
    function create_if_block_1$1(ctx) {
    	let h2;
    	let t1;
    	let hr;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Education History";
    			t1 = space();
    			hr = element("hr");
    			attr_dev(h2, "class", "svelte-p67jbp");
    			add_location(h2, file$2, 38, 8, 1086);
    			attr_dev(hr, "class", "svelte-p67jbp");
    			add_location(hr, file$2, 39, 8, 1121);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:8) {#if resumeData.education }",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each resumeData.education as institution}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*institution*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let h4;
    	let t2_value = /*institution*/ ctx[1].degree + "";
    	let t2;
    	let t3;
    	let span0;
    	let t4_value = /*institution*/ ctx[1].location + "";
    	let t4;
    	let t5;
    	let span1;
    	let t6_value = /*institution*/ ctx[1].year + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = text(" - ");
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span1 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(h3, "class", "svelte-p67jbp");
    			add_location(h3, file$2, 43, 12, 1232);
    			attr_dev(h4, "class", "svelte-p67jbp");
    			add_location(h4, file$2, 44, 12, 1272);
    			add_location(span0, file$2, 44, 44, 1304);
    			attr_dev(span1, "class", "abs-tr svelte-p67jbp");
    			add_location(span1, file$2, 45, 12, 1352);
    			attr_dev(div, "class", "rel svelte-p67jbp");
    			add_location(div, file$2, 42, 8, 1202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, h4);
    			append_dev(h4, t2);
    			append_dev(div, t3);
    			append_dev(div, span0);
    			append_dev(span0, t4);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);
    			append_dev(div, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resumeData*/ 1 && t0_value !== (t0_value = /*institution*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resumeData*/ 1 && t2_value !== (t2_value = /*institution*/ ctx[1].degree + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*resumeData*/ 1 && t4_value !== (t4_value = /*institution*/ ctx[1].location + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*resumeData*/ 1 && t6_value !== (t6_value = /*institution*/ ctx[1].year + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:8) {#each resumeData.education as institution}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let if_block = /*resumeData*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (if_block) if_block.c();
    			add_location(article, file$2, 3, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			if (if_block) if_block.m(article, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*resumeData*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(article, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BaseResume', slots, []);
    	let { resumeData } = $$props;
    	const writable_props = ['resumeData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BaseResume> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resumeData' in $$props) $$invalidate(0, resumeData = $$props.resumeData);
    	};

    	$$self.$capture_state = () => ({ resumeData });

    	$$self.$inject_state = $$props => {
    		if ('resumeData' in $$props) $$invalidate(0, resumeData = $$props.resumeData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resumeData];
    }

    class BaseResume extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { resumeData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BaseResume",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resumeData*/ ctx[0] === undefined && !('resumeData' in props)) {
    			console.warn("<BaseResume> was created without expected prop 'resumeData'");
    		}
    	}

    	get resumeData() {
    		throw new Error("<BaseResume>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeData(value) {
    		throw new Error("<BaseResume>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/LetterPaper.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/components/LetterPaper.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-f2rpz1");
    			add_location(div, file$1, 3, 0, 110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LetterPaper', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LetterPaper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class LetterPaper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LetterPaper",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var name="John Doe";var email="johndoe@email.com";var phone="123-456-7890";var website="johndoe.com";var bio="Fusce ac felis sit amet ligula pharetra condimentum. Praesent venenatis metus at tortor pulvinar varius. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Praesent ac sem eget est egestas volutpat.";var jobs=[{title:"Cashier",organization:"What-A-Burger",location:"Stanford, CA",duration:"2014 - 2018",description:"Fusce ac felis sit amet ligula pharetra condimentum. Praesent venenatis metus at tortor pulvinar varius. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Praesent ac sem eget est egestas volutpat."},{title:"Cashier",organization:"What-A-Burger",location:"Stanford, CA",duration:"2014 - 2018",description:"Fusce ac felis sit amet ligula pharetra condimentum. Praesent venenatis metus at tortor pulvinar varius. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Praesent ac sem eget est egestas volutpat."},{title:"Cashier",organization:"What-A-Burger",location:"Stanford, CA",duration:"2014 - 2018",description:"Fusce ac felis sit amet ligula pharetra condimentum. Praesent venenatis metus at tortor pulvinar varius. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Praesent ac sem eget est egestas volutpat."}];var education=[{name:"ITT Technical Institute",location:"New York, NY",year:"1998",degree:"Bachelor of Arts, Communications"}];var resumeJson = {name:name,email:email,phone:phone,website:website,bio:bio,jobs:jobs,education:education};

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (15:33) 
    function create_if_block_1(ctx) {
    	let resumetemplatebase;
    	let current;

    	resumetemplatebase = new BaseResume({
    			props: { resumeData: /*resumeData*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resumetemplatebase.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resumetemplatebase, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resumetemplatebase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resumetemplatebase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resumetemplatebase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:33) ",
    		ctx
    	});

    	return block;
    }

    // (13:1) {#if resumeType === 'ZG'}
    function create_if_block(ctx) {
    	let resumetemplatezg;
    	let current;

    	resumetemplatezg = new ResumeZG({
    			props: { resumeData: /*resumeData*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(resumetemplatezg.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resumetemplatezg, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resumetemplatezg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resumetemplatezg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resumetemplatezg, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:1) {#if resumeType === 'ZG'}",
    		ctx
    	});

    	return block;
    }

    // (12:1) <LetterPaper>
    function create_default_slot(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*resumeType*/ ctx[0] === 'ZG') return 0;
    		if (/*resumeType*/ ctx[0] === 'Base') return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:1) <LetterPaper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let letterpaper;
    	let current;

    	letterpaper = new LetterPaper({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(letterpaper.$$.fragment);
    			add_location(main, file, 10, 0, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(letterpaper, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const letterpaper_changes = {};

    			if (dirty & /*$$scope, resumeType*/ 9) {
    				letterpaper_changes.$$scope = { dirty, ctx };
    			}

    			letterpaper.$set(letterpaper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letterpaper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letterpaper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(letterpaper);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { resumeType } = $$props;
    	let { resumeJsonFile } = $$props;
    	let resumeData = resumeJson;
    	const writable_props = ['resumeType', 'resumeJsonFile'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resumeType' in $$props) $$invalidate(0, resumeType = $$props.resumeType);
    		if ('resumeJsonFile' in $$props) $$invalidate(2, resumeJsonFile = $$props.resumeJsonFile);
    	};

    	$$self.$capture_state = () => ({
    		resumeType,
    		resumeJsonFile,
    		ResumeTemplateZG: ResumeZG,
    		ResumeTemplateBase: BaseResume,
    		LetterPaper,
    		resumeJson,
    		resumeData
    	});

    	$$self.$inject_state = $$props => {
    		if ('resumeType' in $$props) $$invalidate(0, resumeType = $$props.resumeType);
    		if ('resumeJsonFile' in $$props) $$invalidate(2, resumeJsonFile = $$props.resumeJsonFile);
    		if ('resumeData' in $$props) $$invalidate(1, resumeData = $$props.resumeData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resumeType, resumeData, resumeJsonFile];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { resumeType: 0, resumeJsonFile: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*resumeType*/ ctx[0] === undefined && !('resumeType' in props)) {
    			console.warn("<App> was created without expected prop 'resumeType'");
    		}

    		if (/*resumeJsonFile*/ ctx[2] === undefined && !('resumeJsonFile' in props)) {
    			console.warn("<App> was created without expected prop 'resumeJsonFile'");
    		}
    	}

    	get resumeType() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeType(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get resumeJsonFile() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resumeJsonFile(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            resumeType: 'Base',
            resumeJsonFile: 'john-doe'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
