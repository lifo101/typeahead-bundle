<?php

namespace Lifo\TypeaheadBundle\Form\DataTransformer;

use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Driver\DriverException;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Symfony\Component\Form\Exception\UnexpectedTypeException;

class EntitiesToPropertyTransformer extends EntityToPropertyTransformer
{
    public function transform($array)
    {
        if (null === $array || $array === '') {
            return array();
        }

        if ($array instanceof Collection) {
            $array = $array->toArray();
        }

        if (!is_array($array)) {
            throw new UnexpectedTypeException($array, 'array');
        }

        if ($this->className) {
            $return = array();
            foreach ($array as $entity) {
                $value = parent::transform($entity);
                if ($value !== null) {
                    $return[] = $value;
                }
            }
            return $return;
        }

        return $array;
    }


    public function reverseTransform($array)
    {
        if (null === $array || $array === '') {
            return array();
        }

        if (!is_array($array)) {
            throw new UnexpectedTypeException($array, 'array');
        }

        if ($this->className) {
            try {
                return $this->em->createQueryBuilder()
                    ->select('e')
                    ->from($this->className, 'e')
                    ->where('e.' . $this->property . ' IN (:ids)')
                    ->setParameter('ids', $array)
                    ->getQuery()
                    ->getResult();
            } catch (DriverException $ex) {
                throw new TransformationFailedException('One or more "' . $this->property . '" values are invalid');
            }
        }

        return $array;
    }
}
