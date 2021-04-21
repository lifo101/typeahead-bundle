<?php

namespace Lifo\TypeaheadBundle\Twig\Extension;

use Lifo\TypeaheadBundle\Form\Type\TypeaheadType;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class TypeaheadTwigExtension extends AbstractExtension
{
    public function getName()
    {
        return 'lifo_typeahead';
    }

    public function getFunctions()
    {
        return array(
            new TwigFunction('lifo_typeahead_init', array($this, 'initTypeaheadFunction'), array('needs_environment' => true, 'is_safe' => array('html'))),
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
