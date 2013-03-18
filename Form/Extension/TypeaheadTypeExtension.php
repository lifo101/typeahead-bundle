<?php
namespace Lifo\TypeaheadBundle\Form\Extension;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

// Experimental extension not used yet ...
class TypeaheadTypeExtension extends AbstractTypeExtension
{
    public function __construct(array $cfg = array())
    {
    }
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        //$view->vars[...];
    }
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
        ));
    }
    public function getExtendedType()
    {
        return 'form';
    }
}
