<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response 
    { 
        $user = $request->user();

        if (! $user) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! $user->is_active) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Akun tidak aktif.',
            ], 403);
        }

        if (! $user->hasAnyRole($roles)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}
