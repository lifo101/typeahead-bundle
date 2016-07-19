## Introduction

This is a [Symfony v2.2+](http://symfony.com/) Bundle that provides a 
[Bootstrap](http://twitter.github.com/bootstrap/) **(v2.x or v3.x)**
[Typeahead](http://twitter.github.com/bootstrap/javascript.html#typeahead) widget for use in forms. 
The Typeahead component used in this bundle is the original Bootstrap v2.3 Typeahead library with a few enhancements.

**Update: If you were pointing to `dev-master` in your composer.json and this bundle stopped working change your version to
"^1.*" and run `composer update lifo/typeahead` to update your project.**
 
* If you are using **Bootstrap v2.x** then you must use version **[1.*](https://github.com/lifo101/typeahead-bundle/tree/1.1)**
of this bundle.
* If you are using **Bootstrap v3.x** then you must use version **[2.*](https://github.com/lifo101/typeahead-bundle/tree/2.0)**
of this bundle.

*Note: This bundle does not use the newer [Twitter/Typeahead.js](https://twitter.github.io/typeahead.js/) javascript library.*

### Enhanced Typeahead Features

This bundle adds a few enhancements to the original bootstrap typeahead javascript library: 

* Supports JSON objects
* Caches results
* Delays AJAX request to reduce server requests
* Properly handles pasting via mouse
* Includes an `AJAX Loader` icon
* Supports Non-Entity lookup
* Supports non AJAX loading via a custom callback function

### Screenshots

This example shows a form field that allows a single name to be entered.

![Typeahead (single) Example](Resources/doc/img/typeahead-single.png)

This example shows a form field that allows multiple names to be entered. Clicking on a name link removes the entity. 
The entity in the backend is actually an ArrayCollection and automatically allows adding/removing entities from the list.

![Typeahead (multiple) Example](Resources/doc/img/typeahead-multiple.png)

## How to install

**Note:** *This bundle requires jQuery and Bootstrap to be installed in your environment but does not include them 
directly.* I suggest using the [mopa/bootstrap-bundle](https://github.com/braincrafted/bootstrap-bundle) 
which can help with this for you. 

* Add `lifo/typeahead-bundle` to the "requires" section of your project's `composer.json` file, which can be done 
automatically by running the composer command from within your project directory:

    ```
    composer require lifo/typeahead-bundle
    ```
    
    or manually by editing the composer.json file: 
    
    ```javascript
    {
        // ...
        "require": {
            // ...
            "lifo/typeahead-bundle": "^2.0"
        }
    }
    ```

* Run `composer update` in your project root.
* Update your project `app/AppKernel.php` file and add this bundle to the $bundles array:

  ```php
  $bundles = array(
      // ...
      new Lifo\TypeaheadBundle\LifoTypeaheadBundle(),
  );
  ```

* Add `@lifo_typeahead_js` to your Assetic `javascripts` block. Similar to the block below. 
Your actual setup may differ. Be sure to include it AFTER your jquery and bootstrap libraries.

  ```twig
  {% javascripts filter='?yui_js' output='js/site.js'
      '@lifo_typeahead_js'
  %}
      <script src="{{ asset_url }}"></script>
  {% endjavascripts %}
  ```

* Add `@lifo_typeahead_css` to your Assetic `stylesheets` block. Similar to the block below. 
Your actual setup may differ. 

  ```twig
  {% stylesheets filter='cssrewrite,?yui_css' output='css/site.css'
      '@lifo_typeahead_css'
  -%}
      <link href="{{ asset_url }}" type="text/css" rel="stylesheet" />
  {% endstylesheets %}
  ```

* If you're not using `Assetic` then you will have to manually include the javascript and css files into your project.

  ```twig
  <link href="{{ asset('bundles/lifotypeahead/css/typeaheadbundle.css') }}" type="text/css" rel="stylesheet" />
  <script src="{{ asset('bundles/lifotypeahead/js/bootstrap-typeahead.js') }}"></script>
  <script src="{{ asset('bundles/lifotypeahead/js/typeaheadbundle.js') }}"></script>
  ```

## How to use

Using the typeahead control is extremely simple. The available options are outlined below:

```php
$builder->add('user', 'entity_typeahead', array(
    'class'  => 'MyBundle:User',
    'render' => 'fullname',
    'route'  => 'user_list',
));
```

## Options
* `class` is your entity class. If `null` (or not specified), the items returned from your controller AJAX response 
do not have to be Entities. If not blank, the class is used to map the items to your DB Entities.
* `source` is the name of a function to call that will collect items to display. This or `route` must be specified.
The prototype is: `function(query, process)` where `process` is the callback your function should call 
after you've fetched your list of matching items. It expects a **FLAT** array of strings to render into the 
pull down menu _(Not {id:'...', value:'...'} objects!)_. See the example below for more information.
* `route` is the name of the route to fetch entities from. The controller matching the route will receive the 
following parameters via `POST`:
    * `query` The query string to filter results by.
    * `limit` The maximum number of results to return.
    * `render` The configured `render` name.
    This is what you should use to set the `value` attribute in the AJAX response.
    * `property` The configured `property` name. Normally this is `id`.
    This is what you should use to set the `id` attribute in the AJAX response.
* `route_params` Extra parameters to pass to the `route`.
* `minLength` Minimum characters needed before firing AJAX request.
* `items` Maximum items to display at once *(default: 8)*
* `delay` Delay in milliseconds before firing AJAX *(default: 250)*
* `spinner` Class string to use for loading spinner *(default: "glyphicon glyphicon-refresh spin")* 
**Font-Awesome** example: *"fa fa-refresh fa-spin fa-fw"*
* `multiple` If true the widget will allow multiple entities to be selected. One at a time. This special mode 
creates an unordered list below the typeahead widget to display the selected entities.
* `callback` Callback function (or string) that is called when an item is selected. Prototype: `function(text, data)` 
where `text` is the label of the selected item and `data` is the JSON object returned by the server.
* `render` is the property of your entity to display in the typeahead input. This is used to render the initial
value(s) into the widget. Once a user starts typing, the rendered responses are dependent on the `route` or 
`source` used.

### AJAX Response
The controller should return a `JSON` array in the following format. Note: `id` and `value` properties are required but 
you may include other properties as well.

```javascript
[
  { id: 1, value: 'Displayed Text 1' },
  { id: 2, value: 'Displayed Text 2' }
]
```

Note: If you are using a null `class` option then your JavaScript array should return an `id` and `value` that are 
the same thing. e.g:

```javascript
[
  { id: 'Result 1', value: 'Result 1' },
  { id: 'Result 2', value: 'Result 2' }
]
```

If you do not return the same string for the `id` and `value` you will get confusing results in your UI.

### Custom Source Callback
Here is an example of a custom `source` callback. This example mimics the same result if you had used the `route` option.

```javascript
function get_users(query, process) {
    $.post('/mysite/lookup/users', {query: query}, 'json')
        .success(function (data) {
            // must convert the data array into a flat list of strings. 
            // If your lookup function already returns a flat list, then $.map() is not needed.
            process($.map(data, function(a){
                return a.value;
            }));
        });
}
```

```php
$builder->add('user', 'entity_typeahead', array(
    'class'  => 'MyBundle:User',
    'render' => 'fullname',
    'source' => 'get_users', // a function name in the global javascript "window" object 
));
```

### Template

Your form template might look something like this _(The screenshots above used this template bit)_.
**Note:** The `widget_addon` attribute is a `mopa/bootstrap-bundle` attribute.

```twig
{{ form_row(form.name) }}
{{ form_row(form.owner, { attr: { placeholder: 'Search for user ...'}, widget_addon: {type: 'append', 'icon': 'user'}}) }}
{{ form_row(form.users, { attr: { placeholder: 'Add another user ...'}, widget_addon: {type: 'append', 'icon': 'user'}}) }}
```

## Notes

This bundle renders its form elements in standard Symfony style. You will have to override the form blocks to get the 
proper Bootstrap styles applied. I strongly suggest something like 
[mopa/bootstrap-bundle](https://github.com/phiamo/MopaBootstrapBundle) that will override the Symfony form 
templates with proper Bootstrap versions automatically for you.

