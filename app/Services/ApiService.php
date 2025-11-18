<?php

namespace App\Services;

use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ApiService
{
    
    public function sendDataToCrm($data)
    {
        try
		{
			$dat='&name='.$data['name'].'&countrycode='.$data['countrycode'].'&mobileno='.$data['mobile'].'&email='.$data['email'].'&type='.$data['category_name'].'&source=HR Form';
			$client = new Client();
			$response = $client->get('https://app.getleadcrm.com/api/gl-website-contacts?token=gl_55191348deaca7b60aaf'.$dat);
			//return $response->getBody();
			return json_decode($response->getBody(), true);
		}
		catch(\Exception $e)
		{
			\Log::info($e->getmessage());
			return $e->getMessage();
		}
	}
	
	
	
	
	
}
