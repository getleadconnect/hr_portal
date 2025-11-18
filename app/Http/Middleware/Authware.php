<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Auth;

class Authware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check())
            return redirect('admin/login');
		
        $user = Auth::user();
        if ($user->isAdmin()){
			return $next($request);
        }
		else
		{
			return redirect('admin/login');
		}
    }
}
