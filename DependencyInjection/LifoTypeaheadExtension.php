<?php

namespace Lifo\TypeaheadBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class LifoTypeaheadExtension extends Extension
//implements PrependExtensionInterface
{

    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.yml');
    }

    //public function prepend(ContainerBuilder $container)
    //{
    //    $configs = $container->getExtensionConfig($this->getAlias());
    //    $config = $this->processConfiguration(new Configuration(), $configs);
    //    $container->prependExtensionConfig('twig', $config);
    //}

}
