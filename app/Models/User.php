<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

use App\Common\Variables;
use Carbon\Carbon;
use Auth;
use App\Facades\FileUpload;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{

//implements JWTSubject
    use Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    const ACTIVATE = 1;
    const DEACTIVATE = 0;

    const ADMIN = 1;
	const USERS = 2;

	protected $table = 'users';
    protected $primaryKey = 'id';
	
	protected $fillable = [
        'user_name', 'email','countrycode', 'mobile','password','datetime_last_login','role_id','status',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $guarded = ['role_id', 'status'];

    public static $passwordRule = ['password' => 'required|min:6|confirmed'];



    public static $userRule = [
        'user_name' => 'required|max:25',
        'email' => 'required|email|unique:users,email',
        'mobile' => 'required|numeric|digits_between:8,15|unique:users,user_mobile',
        'password' => 'required|min:6',
        // 'password_confirmation' => 'required_with:password|confirmed|min:6'
    ];

 
    public static $userRuleMessage = [
        'user_name.required' => 'Username is required',
        'email.required' => 'Email is required',
        'email.email' => 'Incorrect Email format',
        'mobile.required' => 'Mobile Number is required',
        'mobile.numeric' => 'Enter number in correct format ',
    ];
		
	public static $userUpdate = [
        'user_name_edit' => 'required|max:25',
        'email_edit' => 'required',
        'mobile_edit' => 'required|numeric|digits_between:8,15',
    ];
	 
    public static $updateMessage = [
        'user_name_edit.required' => 'Username is required',
        'email_edit.required' => 'Email is required',
        'email_edit.email' => 'Incorrect Email format',
        'mobile_edit.required' => 'Mobile Number is required',
        'mobile_edit.numeric' => 'Enter number in correct format ',
    ];


    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }


    public static $telegramUpdate = [
        'telegram_id' => 'required',
    ];

    public static $messageTelegramUpdate = [
        'telegram_id.required' => 'Telegram Id is  required',
   ];

    public function scopeActive()
    {
            return $this->where('status',1);
    }

    public function isAdmin()
    {
        if (Auth::user()->role_id == 1) {
            return true;
        }
    }

}
