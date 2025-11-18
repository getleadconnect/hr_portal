<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use Carbon\Carbon;

class Application extends Model
{
    use SoftDeletes;
	
	
	protected $guarded = [];  
	
	protected $primaryKey = 'id';
    protected $table = 'applications';


	public static function totalCount()
    {
        return self::count();
    }

	public static function thisWeekCount()
    {

        $start_date=Carbon::now()->locale('en_US')->startOfWeek();
        $end_date=Carbon::now()->locale('en_US')->endOfWeek();
		
        return self::whereBetween('created_at', [$start_date,$end_date])->count();
    }
	
	public static function thisMonthCount()
    {
        return self::whereMonth('created_at', date('m'))->count();
    }
	
	public static function thisYearCount()
    {
        return self::whereYear('created_at', date('Y'))->count();
    }
	
}
