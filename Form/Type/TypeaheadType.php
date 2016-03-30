<?php

namespace Lifo\TypeaheadBundle\Form\Type;

use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Bridge\Doctrine\Form\EventListener\MergeDoctrineCollectionListener;
use Symfony\Bridge\Doctrine\Form\DataTransformer\CollectionToArrayTransformer;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\Exception\UnexpectedTypeException;
use Symfony\Component\Form\Exception\RuntimeException;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Doctrine\ORM\EntityManager;
use Doctrine\Common\Collections\Collection;
use Lifo\TypeaheadBundle\Form\DataTransformer\EntityToPropertyTransformer;
use Lifo\TypeaheadBundle\Form\DataTransformer\EntitiesToPropertyTransformer;

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
		//$cfg = $form->getConfig();

		// assign some variables to the view template
		$vars = array('render', 'route', 'route_params', 'property',
			'minLength', 'items', 'delay', 'spinner',
			'multiple', 'allow_add', 'allow_remove', 'empty_value',
			'resetOnSelect', 'callback');
		foreach ($vars as $var) {
			$view->vars[$var] = $options[$var];
		}

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

	public function configureOptions(OptionsResolver $resolver)
	{

		//$resolver->setOptional(array(''));
        $resolver->setRequired(array('class','render','route'));
		$resolver->setDefaults(array(
            'em'                => null,
            'query_builder'     => null,
            'property'          => null,
            'empty_value'       => '',
            'route_params'      => null,

            'multiple'          => false,
            'allow_add'         => false,
            'allow_remove'      => false,

            'delay'             => 250,
            'minLength'         => 2,
            'items'             => 10,
            'spinner'           => 'glyphicon glyphicon-refresh spin',
            'resetOnSelect'     => function(Options $options) { return $options['multiple']; },
            'callback'          => null,

            'compound'          => false, //function(Options $options){ return $options['multiple']; },
		));
	}

	public function getBlockPrefix()
	{
		return 'entity_typeahead';
	}

	// BC < sf30
	public function getName()
	{
		return $this->getBlockPrefix();
	}

}
