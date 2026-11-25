@php
    $heading = 'Votre code de vérification';
    $preheader = 'Code : '.$otp.'. Il expire dans 15 minutes.';
@endphp
@extends('emails.layout')

@section('content')
<p style="margin: 0 0 16px;">Bonjour {{ $user->name }}, saisissez ce code pour confirmer votre adresse e-mail et terminer la création de votre compte Biolinko.</p>
<div style="margin: 0 0 16px; padding: 16px; background: #F6F5F1; border-radius: 10px; text-align: center; font-size: 30px; font-weight: 700; letter-spacing: 8px;">{{ $otp }}</div>
<p style="margin: 0; font-size: 14px; color: #6B6A64;">Le code expire dans 15 minutes. Si vous n’avez pas demandé à créer de compte, ignorez simplement cet e-mail.</p>
@endsection
