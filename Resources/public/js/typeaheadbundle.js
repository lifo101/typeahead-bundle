/*!
 * typeaheadbundle.js
 * Part of the Lifo/TypeaheadBundle bundle for Symfony 2.1+
 * @author Jason Morriss <lifo2013@gmail.com>
 * @link https://github.com/lifo101/typeahead-bundle
 */

/*
 * Override the base Typeahead object with new features.
 * Based on https://gist.github.com/ecmel/4365063
 */
!function($) {
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

    // default loading icon url. Using a "data" url here may waste a little
    // space but this will be easier to get it working out-of-the-box without
    // having the user worry about URL paths and an external image.
    defs.loadingIconUrl =
        'data:image/gif;base64,' +
        'R0lGODlhDgAOAIQAACQmJJyanMzOzPTy9GRiZNze3Ly+vDw6PNTW1Pz6/Hx+fOTm5MTGxDQyNKSm' +
        'pNTS1PT29OTi5MTCxDw+PNza3Pz+/JSSlP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05F' +
        'VFNDQVBFMi4wAwEAAAAh+QQJCwAXACwAAAAADgAOAAAFb+AlVssTWYQDiSzESEahAMD0sMPwGNIS' +
        'NIADZVVhMAaLimhgoTwYlQivwGIteJGdJFEdwUyUSJcVoRTO4vFlYdZyuwne42pIV+mLhECCVF4S' +
        'BRAIUBc5OwwLERISRysiLosUFAYGR11RAgsFc34XIQAh+QQJCwAYACwAAAAADgAOAIQkJiSUlpTU' +
        '0tTs7uy8vrxkYmTc3tz8+vykoqQ8Pjzc2tz09vTExsSEhoTk5uSsqqw0MjTU1tT08vTEwsRsbmzk' +
        '4uT8/vykpqT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFbCAmWo5QGYJjiezCTIShEBMjsZIk0E4F' +
        '2wqMhWFTiQ4GCSWxqNAMLNYDALjsJoeoaAEBFCqKipaFaAQMBvEYA0bRstoDLUUgqKOOuuNAlBgx' +
        'SAsRDFk5ERMTPYg2Cy0MNAqHBDZaFhUmKH8YIQAh+QQJCwAYACwAAAAADgAOAIQkJiSUlpTU0tTs' +
        '7uy8vrxkYmTc3tz8+vykoqQ8Pjzc2tz09vTExsSEhoTk5uSsqqw0MjTU1tT08vTEwsRsbmzk4uT8' +
        '/vykpqT///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFbCAmWo5QGYJjiezCTIShEBMjsZIk0E4F2wuM' +
        'hWFTiQ4GSYRxqNAMLJZjMqnsJofoEWZSVLSsisJA/oIxiEbgmtUuIICCg0AwRy8AAOJAlBgxSBIU' +
        'CUE5EVQ9VAwDCi0MNAqHBDZaFlYnKSsiIQAh+QQJCwAXACwAAAAADgAOAIQkJiScmpzMzsz08vRk' +
        'YmTc3ty8vrzU1tT8+vx8fnw8Pjzk5uTExsSMjow0MjSkpqTU0tT09vTk4uTEwsTc2tz8/vyUkpT/' +
        '//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFb+AlVgskFdBSiWzETEZBGRMzsMMA0YsE25FLhWFT' +
        'iRCFwYGBkNAKLNZiMpHsJojoEWaiSLQsCaVA/oIvi/E1q0XQUgaDObqILxCCycB4GVgKSys5OwwL' +
        'AQ4AChQ3Ii5UFAkAiQJaFRICCw0ED2wXIQAh+QQJCwAXACwAAAAADgAOAIQkJiScnpzU0tTs7uxk' +
        'YmS8vrzc3tz8+vw8PjykpqTc2tz09vSMjozExsTk5uQ0MjTU1tT08vRsbmzEwsTk4uT8/vysqqz/' +
        '//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFbOAlVo5AGYJTiezSTIWhFFMTsVEk0A4F24tLpWFT' +
        'iQ6GCKRxoNAMLJZjMqHsJofoEWZSULQsisJA/oIvjvE1qz3QUoWCOeqIOw7EiCV4QS6WKzkSAA8J' +
        'PjURfBcKCAAADDMFNloLCQQBKEYiIQAh+QQJCwAYACwAAAAADgAOAIQkJiSUlpTMzsz08vRkYmTc' +
        '3ty8vrw8OjzU1tT8+vykoqSEhoTk5uTExsQ0MjTU0tT09vTk4uTEwsQ8Pjzc2tz8/vykpqSUkpT/' +
        '//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAFayAmVswTFQ9TiSzUSEZBGVIzsMPw0EwE2xBMpWFTiRKF' +
        'AaKRiNAKLBZDIonsJInoEWaiRLSsCKUQWCjAolOBAHAEtQmD4WEBAC7gqYEBmRwoRhhISg0rAhRX' +
        'PVRAOC8SMjQ2WhURAicpWSIhACH5BAkLABcALAAAAAAOAA4AhCQmJJSWlMzOzPTy9Nze3GRiZLy+' +
        'vNTW1Pz6/Dw+PKSipOTm5ISGhMTGxDQyNNTS1PT29OTi5MTCxNza3Pz+/KSmpJSSlP///wAAAAAA' +
        'AAAAAAAAAAAAAAAAAAAAAAAAAAVs4CVSyxMRz0KJLNRIBjEZUjOwwvTQSwTbkAskkZioRIjI4NBA' +
        'VAAAC4u1gC0KAMdtekHAHgGGgsuKTAjmCFm0mER2EgTZazAZDGru4q5q2I5dBBBMKwMDDxISPYlA' +
        'LQ00Ewc/WywUbycpKyIhACH5BAkLABcALAAAAAAOAA4AhCQmJJyenNTS1Ozu7GRiZLy+vNze3Pz6' +
        '/Dw+PKSmpNza3PT29IyOjMTGxOTm5DQyNNTW1PTy9GxubMTCxOTi5Pz+/KyqrP///wAAAAAAAAAA' +
        'AAAAAAAAAAAAAAAAAAAAAAVr4CUuCREYglOJrIIAAKMUUxOx0SABj0VNBdviUmnYLLfLwbAQNCq/' +
        'AoXFcgAdAtqBKjoABQbDlCuiKMSKMdmRzk623EOhIKDM1dVr0abqGiIQTxcREQITEw4/NRFDIw00' +
        'ChBANlxQdSh9IiEAOw==';

    defs.beforeSend = function(xhr, opts) {
        var icon = this.$addon.find('[class*="icon-"]');
        icon.css({ background: 'url(' + this.options.loadingIconUrl + ') top center no-repeat' });
        //icon.addClass('icon-spinner icon-spin'); // font-awesome
    };

    defs.afterSend = function(xhr, status) {
        var icon = this.$addon.find('[class*="icon-"]');
        icon.css({ background: '' });
        //icon.removeClass('icon-spinner icon-spin'); // font-awesome
    };

    defs.source = function(query, process) {
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
            data: { query: query, limit: this.options.items },
            beforeSend: this.options.beforeSend,
            complete: this.options.afterSend,
            success: function(data) {
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

    base.select = function() {
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
    }

    base.updater = function(item) {
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
    }

    base.blur = function(e) {
        // only call updater if a menu item was not selected. This prevents a
        // flicker of the original (orig) from showing up briefly when user
        // selects an item from the menu.
        if (!this.mousedover) {
            this.updater($.trim(this.$element.val()));
        }
        this._blur(e);
    }

    base.lookup = function() {
        if (this.options.delay) {
            clearTimeout(this.delayedLookup);
            this.delayedLookup = setTimeout($.proxy(function(){ this._lookup() }, this), this.options.delay);
        } else {
            this._lookup();
        }
    }

    base.listen = function() {
        this._listen();

        this.ids = {};
        this.queries = {};

        // save original value when page was loaded
        if (this.orig === undefined) {
            this.orig = { value: this.$element.val() };
        }

        // maintain relationship with another element that will hold the
        // selected ID (usually a hidden input).
        if (this.options.id) {
            this.$id = $('#' + this.options.id.replace(/(:|\.|\[|\])/g, '\\$1'));
            if (this.$element.val() != '') {
                this.ids[this.$element.val()] = { id: this.$id.val(), value: this.$element.val() };
            }
            this.orig.id = this.$id.val();
        }

        // handle pasting via mouse
        this.$element
            //.on('contextmenu', $.proxy(this.on_contextmenu, this))
            .on('paste', $.proxy(this.on_paste, this));

        // any "addon" icons?
        this.$addon = this.$element.siblings('.add-on');
    }

    base.on_paste = function(e) {
        // since the pasted text has not actually been updated in the input
        // when this event fires we have to put a very small delay before
        // triggering a new lookup or else it'll simply do the lookup with
        // the current text in the input.
        clearTimeout(this.pasted);
        this.pasted = setTimeout($.proxy(function(){ this.lookup(); this.pasted = undefined; }, this), 100);
    }

    // convienence method to auto-select the input text; might not actually
    // be wanted in all cases but for now I want it...
    //base.on_contextmenu = function(e) {
    //    this.$element.select();
    //}
}(jQuery)

!function($) {
    $(function(){
        // The controller handling the request already filtered the items and
        // its possible it matched things that are not in the displayed label so
        // we must return true for all.
        var matcher = function(){ return true };

        // callback when the $element is changed. Gives our customization a
        // chance to act on the new data.
        var change = function(text, data){
            var _id = this.$id.attr('id');
            var list = $('#' + _id + '_list');
            if (list.length) {
                var li = list.find('#' + _id + '_' + data.id);
                if (!li.length) {
                    // convert 'name_subname_extraname' to 'name[subname][extraname][]'
                    var name = _id.split(/_/);
                    name = (name.length > 1 ? name.shift() + '[' + name.join('][') + ']' : name.join()) + '[]';
                    li = $( this.$id.data('prototype') );
                    li.data('value', data.id)
                        .find('input:hidden').val(data.id).attr('id', _id + '_' + data.id).attr('name', name).end()
                        .find('.lifo-typeahead-item').text(text).end()
                        .appendTo(list)
                        ;
                }
            }

            if ($.isFunction(this.options.callback)) {
                this.options.callback.apply(this, [text, data]);
            }
        };

        $('input[data-provide="lifo-typeahead"]').each(function(){
            var me = $(this),
                d = me.data(),
                opts = {
                    id: me.attr('id').replace(/_text$/, ''),
                    url: d.url,
                    change: change,
                    matcher: matcher
                };
            if (undefined !== d.delay && d.delay != '') opts.delay = d.delay;
            if (undefined !== d.items && d.items != '') opts.items = d.items;
            if (undefined !== d.minlength && d.minlength != '') opts.minLength = d.minlength;
            if (undefined !== d.loadingiconurl && d.loadingiconurl != '') opts.loadingIconUrl = d.loadingiconurl;
            if (undefined !== d.resetonselect && d.resetonselect != '') opts.resetOnSelect = d.resetonselect ? true : false;
            if (undefined !== d.callback && d.callback != '') opts.callback = d.callback;

            // allow the defined callback to be a function string
            if (typeof opts.callback == 'string'
                && opts.callback in window
                && $.isFunction(window[opts.callback])) {
                opts.callback = window[opts.callback];
            }

            me.typeahead(opts);
            $('#' + me.data('typeahead').$id.attr('id') + '_list').on({
                'click.lifo-typeahead': function(e){
                    // @todo make this 'prettier' ... fade out, etc...
                    $(this).closest('li').remove();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, 'a');
        });
    });
}(jQuery);

