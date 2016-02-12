<?php

namespace Lifo\TypeaheadBundle\Twig\Extension;

use Assetic\Asset\AssetCollection;
use Assetic\Asset\StringAsset;
use Assetic\Filter\Yui\JsCompressorFilter;
use Lifo\TypeaheadBundle\Form\Type\TypeaheadType;

class TypeaheadTwigExtension extends \Twig_Extension
{
    public function getName()
    {
        return 'lifo_typeahead';
    }

    public function getFunctions()
    {
        return array(
			new \Twig_SimpleFunction('lifo_typeahead_init', array($this, 'initTypeaheadFunction'), array('needs_environment' => true, 'is_safe' => array('html'))),
        );
    }

    public function initTypeaheadFunction(\Twig_Environment $env)
    {
        if (!TypeaheadType::$initialized) {
            TypeaheadType::$initialized = true;
            $url = $env->getExtension('assets')->getAssetUrl('bundles/lifotypeahead/js/typeaheadbundle.js');
            return "<script type=\"text/javascript\" src=\"$url\"></script>";
        }
        return '';
    }

}
