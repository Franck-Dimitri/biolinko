<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
            'plan' => \App\Http\Middleware\EnsureUserHasPlan::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/webhooks/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->respond(function (Symfony\Component\HttpFoundation\Response $response, Throwable $e, Request $request) {
            // Do not override API, JSON or static asset responses
            if ($request->is('api/*') || $request->wantsJson()) {
                return $response;
            }

            if (preg_match('/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|woff|woff2|ttf)$/i', $request->path())) {
                return $response;
            }

            $statusCode = $response->getStatusCode();

            // Handle CSRF / Session expiration
            if ($statusCode === 419) {
                return back()->with([
                    'message' => 'Votre session a expiré. Veuillez recharger la page et réessayer.',
                ]);
            }

            // In production/staging handle 403, 404, 500, 503. In local handle 403, 404.
            $shouldHandle = ! app()->environment('local')
                ? in_array($statusCode, [403, 404, 500, 503])
                : in_array($statusCode, [403, 404]);

            if ($shouldHandle) {
                return Inertia::render('Errors/Index', [
                    'status' => $statusCode,
                ])
                ->toResponse($request)
                ->setStatusCode($statusCode);
            }

            return $response;
        });
    })->create();
