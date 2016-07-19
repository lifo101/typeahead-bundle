<?php

namespace Lifo\TypeaheadBundle\Form\Type;

use Doctrine\ORM\EntityManager;
use Lifo\TypeaheadBundle\Form\DataTransformer\EntitiesToPropertyTransformer;
use Lifo\TypeaheadBundle\Form\DataTransformer\EntityToPropertyTransformer;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Exception\RuntimeException;
use Symfony\Component\Form\Exception\UnexpectedTypeException;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class TypeaheadType extends AbstractType
{
    public static $initialized = false;

    protected $container;
    protected $em;
    protected $router;

    public function __construct(Container $container, EntityManager $em, Router $router)
    {
        $this->container = $container;
        $this->em = $em;
        $this->router = $router;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // @todo I could combine the transformers below into a single class...
        if ($options['multiple']) {
            $builder->addViewTransformer(new EntitiesToPropertyTransformer(
                $options['em'] ?: $this->em,
                $options['class'],
                $options['property']
            ), true);
        } else {
            $builder->addViewTransformer(new EntityToPropertyTransformer(
                $options['em'] ?: $this->em,
                $options['class'],
                $options['property']
            ), true);
        }
    }

    public function finishView(FormView $view, FormInterface $form, array $options)
    {
        parent::finishView($view, $form, $options);

        // assign some variables to the view template
        $vars = array(
            'render', 'route', 'route_params', 'property', 'minLength', 'items', 'delay', 'spinner', 'multiple',
            'allow_add', 'allow_remove', 'empty_value', 'resetOnSelect', 'callback', 'source',
        );
        foreach ($vars as $var) {
            $view->vars[$var] = $options[$var];
        }
        $view->vars['simple'] = empty($options['class']);

        // convert the route into an URL
        if (!empty($options['route'])) {
            try {
                $params = $options['route_params'] ?: array();
                if (!is_array($params) and !($params instanceof \Traversable)) {
                    throw new UnexpectedTypeException($params, "array or \\Traversable");
                }
                $view->vars['url'] = $this->router->generate($options['route'], $params);
            } catch (\InvalidArgumentException $e) {
                throw new RuntimeException("Route \"{$options['route']}\" configured on " . get_class() . " does not exist.");
            }
        }
    }

    /**
     * Pre Symfony 2.7 compatibility
     *
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $this->configureOptions($resolver);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setRequired(array('render'));
        $resolver->setDefaults(array(
            'em'            => null,
            'query_builder' => null,
            'class'         => null,
            'property'      => 'id',
            'empty_value'   => '',
            'route'         => null,
            'route_params'  => null,
            'source'        => null,
            'multiple'      => false,
            'allow_add'     => false,
            'allow_remove'  => false,
            'delay'         => 250,
            'minLength'     => 2,
            'items'         => 10,
            'spinner'       => 'glyphicon glyphicon-refresh spin',
            'callback'      => null,
            'compound'      => false,
            'resetOnSelect' => function (Options $options) {
                return $options['multiple'];
            },
        ));
    }

    public function getName()
    {
        return $this->getBlockPrefix();
    }

    public function getBlockPrefix()
    {
        return 'entity_typeahead';
    }
}
