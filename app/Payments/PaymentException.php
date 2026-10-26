<?php

namespace App\Payments;

use RuntimeException;

/** Refus de l'agrégateur, avec un message montrable au client ou au vendeur. */
class PaymentException extends RuntimeException
{
}
