<?php

namespace Lifo\TypeaheadBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    const DEFAULT_BSJS_FILE  = '%kernel.root_dir%/../vendor/lifo/typeahead-bundle/Lifo/TypeaheadBundle/Resources/public/js/bootstrap-typeahead.js';
    const DEFAULT_JS_FILE    = '%kernel.root_dir%/../vendor/lifo/typeahead-bundle/Lifo/TypeaheadBundle/Resources/public/js/typeaheadbundle.js';
    const DEFAULT_JS_OUTPUT  = 'js/lifo_typeahead.js';
    const DEFAULT_CSS_FILE   = '%kernel.root_dir%/../vendor/lifo/typeahead-bundle/Lifo/TypeaheadBundle/Resources/public/css/typeaheadbundle.css';
    const DEFAULT_CSS_OUTPUT = 'css/lifo_typeahead.css';

    /**
     * {@inheritDoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('lifo_typeahead');

        $rootNode
            ->children()
                ->arrayNode('auto_configure')
                    ->info('Automatically configure subsystems?')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->booleanNode('assetic')->defaultTrue()->end()
                        ->booleanNode('twig')->defaultTrue()->end()
                    ->end()
                ->end()
                ->scalarNode('typeahead_js_file')
                    ->defaultValue(self::DEFAULT_JS_FILE)
                    ->info('(for assetic) Location of the typeaheadbundle.js file (normally the file that comes with lifo/typeahead-bundle')
                ->end()
                ->scalarNode('typeahead_bsjs_file')
                    ->defaultValue(self::DEFAULT_BSJS_FILE)
                    ->info('(for assetic) Location of the bootstrap-typeahead.js file (normally the file that comes with lifo/typeahead-bundle')
                ->end()
                ->scalarNode('typeahead_js_output')
                    ->defaultValue(self::DEFAULT_JS_OUTPUT)
                    ->info('(for assetic) Output location for typeahead JS code. Should be relative to your web directory.')
                ->end()
                ->scalarNode('typeahead_css_file')
                    ->defaultValue(self::DEFAULT_CSS_FILE)
                    ->info('(for assetic) Location of the typeaheadbundle.css file (normally the file that comes with lifo/typeahead-bundle')
                ->end()
                ->scalarNode('typeahead_css_output')
                    ->defaultValue(self::DEFAULT_CSS_OUTPUT)
                    ->info('(for assetic) Output location for typeahead CSS styles. Should be relative to your web directory.')
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
