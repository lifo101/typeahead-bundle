<?php

namespace Lifo\TypeaheadBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Symfony\Component\Form\Exception\UnexpectedTypeException;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Doctrine\ORM\EntityManager;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;

class EntityToPropertyTransformer implements DataTransformerInterface
{
    protected $em;
    protected $className;
    protected $property;
    protected $unitOfWork;
    protected $accessor;

    public function __construct(EntityManager $em, $class, $property = 'id')
    {
        $this->em = $em;
        $this->unitOfWork = $this->em->getUnitOfWork();
        $this->className = $class;
        $this->property = $property;
        $this->accessor = PropertyAccess::createPropertyAccessor();
    }

    public function transform($entity)
    {
        if (empty($entity)) {
            return null;
        }

        if ($this->className) {
            if (!empty($this->property)) {
                return $this->accessor->getValue($entity, $this->property);
            } else {
                return current($this->unitOfWork->getEntityIdentifier($entity));
            }
        }

        return $entity;
    }


    public function reverseTransform($value)
    {
        if (empty($value)) {
            return null;
        }

        if ($this->className) {
            $repo = $this->em->getRepository($this->className);
            if (!empty($this->property)) {
                return $repo->findOneBy(array($this->property => $value));
            } else {
                return $repo->find($value);
            }
        }

        return $value;
    }
}
