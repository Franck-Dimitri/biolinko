@php
    $contact = config('biolinko.contact.email', 'contact@biolinko.app');
    $heading = match ($type) {
        'product_deleted' => 'Un produit a été retiré de votre boutique',
        'store_deleted' => 'Votre boutique a été supprimée',
        'store_suspended' => 'Votre boutique a été mise hors ligne',
        'account_banned' => 'Votre compte est suspendu',
        'account_unbanned' => 'Votre compte est de nouveau actif',
        default => 'Information sur votre compte',
    };
@endphp
@extends('emails.layout')

@section('content')
<p style="margin: 0 0 12px;">Bonjour {{ $user->name }},</p>
@if ($type === 'product_deleted')
    <p style="margin: 0 0 12px;">L’équipe Biolinko a retiré le produit <strong>{{ $itemName }}</strong> de votre boutique.</p>
@elseif ($type === 'store_deleted')
    <p style="margin: 0 0 12px;">L’équipe Biolinko a supprimé votre boutique <strong>{{ $itemName }}</strong>.</p>
@elseif ($type === 'store_suspended')
    <p style="margin: 0 0 12px;">L’équipe Biolinko a mis votre boutique <strong>{{ $itemName }}</strong> hors ligne. Elle repasse en brouillon : vos clients ne la voient plus.</p>
@elseif ($type === 'account_banned')
    <p style="margin: 0 0 12px;">L’accès à votre compte vendeur ({{ $user->email }}) est suspendu.</p>
@elseif ($type === 'account_unbanned')
    <p style="margin: 0 0 12px;">Votre compte a été réexaminé : vous pouvez de nouveau vous connecter et vendre.</p>
@endif

@if ($reason && $type !== 'account_unbanned')
    <div style="margin: 0 0 16px; padding: 14px 16px; background: #F6F5F1; border-radius: 10px; font-size: 14px;">
        <div style="font-size: 13px; color: #6B6A64;">Motif</div>
        {{ $reason }}
    </div>
@endif

@if ($type === 'account_unbanned')
    @include('emails.partials.button', ['url' => route('login'), 'label' => 'Me connecter'])
@else
    <p style="margin: 0; font-size: 14px; color: #5F5E58;">S’il s’agit d’une erreur, ou si vous avez corrigé le problème, répondez à cet e-mail ou écrivez-nous à <a href="mailto:{{ $contact }}">{{ $contact }}</a>.</p>
@endif
@endsection
