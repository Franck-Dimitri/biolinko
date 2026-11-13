<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PilotApplication extends Model
{
    public const STATUSES = ['new' => 'Nouvelle', 'contacted' => 'Contacté', 'onboarded' => 'Boutique créée', 'declined' => 'Non retenue'];

    public const CHANNELS = ['WhatsApp', 'Instagram', 'TikTok', 'Facebook', 'Boutique physique'];

    public const VOLUMES = ['Moins de 10', '10 à 50', '50 à 200', 'Plus de 200'];

    protected $fillable = ['name', 'business_name', 'phone_whatsapp', 'email', 'city', 'category', 'channels', 'monthly_orders', 'message', 'status'];

    protected $casts = ['channels' => 'array'];
}
