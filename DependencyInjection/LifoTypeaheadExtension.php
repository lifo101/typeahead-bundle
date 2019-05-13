<?php

namespace Lifo\TypeaheadBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\HttpKernel\Kernel;

class LifoTypeaheadExtension extends Extension implements PrependExtensionInterface
{

    public function load(array $configs, ContainerBuilder $container)
    {
//        $configuration = new Configuration();
//        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');
    }

    /**
     * {@inheritDoc}
     */
    public function prepend(ContainerBuilder $container)
    {
        $bundles = $container->getParameter('kernel.bundles');

        $configs = $container->getExtensionConfig($this->getAlias());
        $config = $this->processConfiguration(new Configuration(), $configs);

        // "lifo_typeahead: auto_configure: assetic: true"
        if (isset($bundles['AsseticBundle']) && $config['auto_configure']['assetic']) {
            $this->configureAsseticBundle($container, $config);
        }

        // "lifo_typeahead: auto_configure: twig: true"
        if (isset($bundles['TwigBundle']) && $config['auto_configure']['twig']) {
            $this->configureTwigBundle($container, $config);
        }
    }

    /**
     * @param ContainerBuilder $container The service container
     * @param array            $config    The bundle configuration
     *
     * @return void
     */
    protected function configureAsseticBundle(ContainerBuilder $container, array $config)
    {
        if ($container->hasExtension('assetic')) {
            $container->prependExtensionConfig('assetic', array(
                'assets' => array(
                    // apply in twig template via a javascripts tag using "@lifo_typeahead_js"
                    'lifo_typeahead_js' => array(
                        'inputs' => array(
                            $config['typeahead_bsjs_file'],
                            $config['typeahead_js_file'],
                        ),
                        'output' => $config['typeahead_js_output'],
                    ),
                    // apply in twig template via a stylesheets tag using "@lifo_typeahead_css"
                    'lifo_typeahead_css' => array(
                        'inputs' => array(
                            $config['typeahead_css_file'],
                        ),
                        'output' => $config['typeahead_css_output'],
                    )
                )
            ));
        }
    }

    /**
     * @param ContainerBuilder $container The service container
     * @param array            $config    The bundle configuration
     *
     * @return void
     */
    protected function configureTwigBundle(ContainerBuilder $container, array $config)
    {
        if ($container->hasExtension('twig')) {
            $resources = array('@LifoTypeaheadBundle\Form\typeahead.html.twig');
            if (Kernel::VERSION_ID >= '20600') {
                $container->prependExtensionConfig('twig', array('form_themes' => $resources));
            } else {
                $container->prependExtensionConfig('twig', array('form' => array('resources' => $resources)));
            }
        }
    }
}
