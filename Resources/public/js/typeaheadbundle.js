/*!
 * typeaheadbundle.js
 * Part of the Lifo/TypeaheadBundle bundle for Symfony 2.2+
 * @author Jason Morriss <lifo2013@gmail.com>
 * @link https://github.com/lifo101/typeahead-bundle
 */

/*
 * Override the base Typeahead object with new features.
 * Based on https://gist.github.com/ecmel/4365063
 */
!function ($) {
    var defs = $.fn.typeahead.defaults,
        base = $.fn.typeahead.Constructor.prototype;

    // save original events ...
    base._listen = base.listen;
    base._updater = base.updater;
    base._blur = base.blur;
    base._lookup = base.lookup;
    base._matcher = base.matcher;
    base._render = base.render;
    base._select = base.select;

    defs.delay = 250;               // default delay before triggering lookup
    defs.resetOnSelect = false;     // reset the input when an item is selected?
    defs.change = null;             // onChange callback when $element is changed

    defs.beforeSend = function (xhr, opts) {
        if (!this.options.spinner || this.$addon.data('prev-icon-class') != undefined) return;
        var icon = this.$addon.children().first();
        if (icon.length >= 1) {
            this.$addon.data('prev-icon-class', icon.attr('class'));
            icon.attr('class', this.options.spinner);
        }
    };

    defs.afterSend = function (xhr, status) {
        if (!this.options.spinner || this.$addon.data('prev-icon-class') == undefined) return;
        var icon = this.$addon.children().first();
        if (icon.length >= 1) {
            var cls = this.$addon.data('prev-icon-class');
            this.$addon.removeData('prev-icon-class');
            icon.attr('class', cls);
        }
    };

    defs.source = function (query, process) {
        query = $.trim(query.toLowerCase());

        if (query === '' || query.length < this.options.minLength) {
            return null;
        }

        var that = this,
            items = this.queries[query];

        // return cache if available
        if (items) {
            return items;
        }

        // stop current ajax request
        if (this.xhr) {
            this.xhr.abort();
        }

        // start new ajax request
        this.xhr = $.ajax({
            context: this,
            url: this.options.url,
            type: 'post',
            data: {
                query: query,
                limit: this.options.items,
                property: this.$element.data('property'),
                render: this.$element.data('render')
            },
            beforeSend: this.options.beforeSend,
            complete: this.options.afterSend,
            success: function (data) {
                that.queries[query] = items = [];       // clear cache
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== undefined && data[i].id !== undefined) {
                        // map displayed value to its object
                        that.ids[data[i].value] = data[i];
                        items[i] = data[i].value;
                    } else {
                        var err = "Typeahead Error: data[" + i + "] is missing required properties: " + JSON.stringify(data[i]);
                        if (window.console === undefined) {
                            throw err;
                        } else {
                            console.error(err);
                        }
                    }
                }
                process(items);
            }
        });

        return null;
    };

    base.select = function () {
        var val = this.updater(this.$menu.find('.active').attr('data-value'));
        this.$element
            .val(this.options.resetOnSelect ? '' : val)
            .change();

        if ($.isFunction(this.options.change)) {
            this.options.change.apply(this, [val, this.ids[val]]);
        }

        if (this.options.resetOnSelect) {
            this.$id.val('');
        }

        return this.hide();
    };

    base.updater = function (item) {
        // update value of related field
        if (this.$id && this.ids[item]) {
            this.$id.val(this.ids[item].id);
            // update original to new value so if we blur w/o selecting
            // something the new value will populate.
            this.orig = {
                value: this.ids[item].value,
                id: this.ids[item].id
            };
        } else {
            // user didn't select an item so reset the element and ID.
            // If the item is empty then allow the field to be cleared.
            var val = '', id = '';
            if (this.orig && item != '') {
                val = this.orig.value;
                id = this.orig.id;
            }

            this.$element.val(val);
            if (this.$id) {
                this.$id.val(id);
            }
        }

        return this._updater(item);
    };

    base.blur = function (e) {
        // only call updater if a menu item was not selected. This prevents a
        // flicker of the original (orig) from showing up briefly when user
        // selects an item from the menu.
        if (!this.mousedover) {
            this.updater($.trim(this.$element.val()));
        }
        this._blur(e);
    };

    base.lookup = function () {
        if (this.options.delay) {
            clearTimeout(this.delayedLookup);
            this.delayedLookup = setTimeout($.proxy(function () {
                this._lookup()
            }, this), this.options.delay);
        } else {
            this._lookup();
        }
    };

    base.listen = function () {
        this._listen();

        this.ids = {};
        this.queries = {};

        // save original value when page was loaded
        if (this.orig === undefined) {
            this.orig = {value: this.$element.val()};
        }

        // maintain relationship with another element that will hold the
        // selected ID (usually a hidden input).
        if (this.options.id) {
            this.$id = $('#' + this.options.id.replace(/(:|\.|\[|])/g, '\\$1'));
            if (this.$element.val() != '') {
                this.ids[this.$element.val()] = {id: this.$id.val(), value: this.$element.val()};
            }
            this.orig.id = this.$id.val();
        }

        // handle pasting via mouse
        this.$element
            .on('paste', $.proxy(this.on_paste, this));

        // any "addon" icons?
        this.$addon = this.$element.siblings('.input-group-addon');
    };

    base.on_paste = function () {
        // since the pasted text has not actually been updated in the input
        // when this event fires we have to put a very small delay before
        // triggering a new lookup or else it'll simply do the lookup with
        // the current text in the input.
        clearTimeout(this.pasted);
        this.pasted = setTimeout($.proxy(function () {
            this.lookup();
            this.pasted = undefined;
        }, this), 100);
    };
}(jQuery);

!function ($) {
    $(function () {
        // The controller handling the request already have filtered the items and
        // its possible it matched things that are not in the displayed label so
        // we must return true for all.
        var matcher = function () {
            return true
        };

        // callback when the $element is changed.
        var change = function (text, data) {
            var _id = this.$id.attr('id'),
                list = $('#' + _id + '_list'),
                formName = this.$element.closest('form').prop('name');

            if (list.length) {
                var li = list.find('#' + _id + '_' + data.id);
                if (!li.length) {
                    // convert 'formname_subname_subname' to 'formname[subname][subname][]'
                    // "formname" can safely have underscores
                    var name = (formName ? _id.replace(formName + '_', '') : _id).split('_');
                    if (formName) name.unshift(formName);
                    name = (name.length > 1 ? name.shift() + '[' + name.join('][') + ']' : name.join()) + '[]';
                    li = $(this.$id.data('prototype'));
                    li.data('value', data.id)
                        .find('input:hidden').val(data.id).attr('id', _id + '_' + data.id).attr('name', name).end()
                        .find('.lifo-typeahead-item').text(text).end()
                        .appendTo(list);
                }
            }

            if ($.isFunction(this.options.callback)) {
                this.options.callback.apply(this, [text, data]);
            }
        };

        var typeahead = function () {
            var me = $(this);
            if (me.data('typeahead')) return;

            var d = me.data(),
                opts = {
                    id: me.attr('id').replace(/_text$/, ''),
                    url: d.url,
                    source: d.source,
                    change: change,
                    matcher: matcher
                };
            if (undefined !== d.delay && d.delay != '') opts.delay = d.delay;
            if (undefined !== d.items && d.items != '') opts.items = d.items;
            if (undefined !== d.spinner) opts.spinner = d.spinner;
            if (undefined !== d.minlength && d.minlength != '') opts.minLength = d.minlength;
            if (undefined !== d.resetonselect && d.resetonselect != '') opts.resetOnSelect = d.resetonselect;
            if (undefined !== d.callback && d.callback != '') opts.callback = d.callback;

            // allow the defined callback to be a function string
            if (typeof opts.callback == 'string'
                && opts.callback in window
                && $.isFunction(window[opts.callback])) {
                opts.callback = window[opts.callback];
            }

            if (typeof opts.source == 'string'
                && opts.source in window
                && $.isFunction(window[opts.source])) {
                opts.source = window[opts.source];
            } else {
                opts.source = undefined;
            }


            me.typeahead(opts);

            var list = $('#' + me.data('typeahead').$id.attr('id') + '_list');

            // BS3+ hack. Must move the list outside of the input_group if there is appended icon/btn
            // since braincrafted/bootstrap-bundle or mopa/bootstrap-bundle will wrap the input in an "input_group"
            // we must move the list outside or it breaks the styling of the appended icon/btn.
            // This was the only way I could fix this w/o overridding the templates of those other bundles (which would
            // be a pain since each bundle defines their templates differently).
            if (list.parent().is('.input-group')) {
                list.parent().after(list);
                list.show();
            }

            // on-click handler to remove items from <ul> list
            list.on({
                'click.lifo-typeahead': function (e) {
                    // @todo make this 'prettier' ... fade out, etc...
                    $(this).closest('li').remove();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, 'a');
        };
        // apply to current elements in DOM
        $('input[data-provide="lifo-typeahead"]').each(typeahead);
        // apply to any future elements
        $(document).on('focus.lifo-typeahead.data-api', 'input[data-provide="lifo-typeahead"]', typeahead);
    });
}(window.jQuery);
