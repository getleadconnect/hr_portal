<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\FileUploadService;
use Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
       $this->app->singleton('fileupload', function ()
		 {
          return new FileUploadService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
		if (env('APP_ENV') === 'production') {
			\URL::forceScheme('https');
		}
    }
}
