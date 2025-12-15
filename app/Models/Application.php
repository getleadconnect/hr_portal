<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use Carbon\Carbon;

class Application extends Model
{
    use SoftDeletes;

    // Status constants
    const STATUS_NEW = 'New';
    const STATUS_SHORT_LISTED = 'Short Listed';
    const STATUS_APPOINTED = 'Appointed';
    const STATUS_REJECTED = 'Rejected';
    const STATUS_NOT_FIT = 'Not fit for this job';
    const STATUS_NOT_INTERESTED = 'Not Interested';
    const STATUS_NO_VACANCIES = 'No vacancies now';
    const STATUS_NOT_JOINED = 'Not Joined';

    // Available statuses
    public static $statuses = [
        self::STATUS_NEW,
        self::STATUS_SHORT_LISTED,
        self::STATUS_APPOINTED,
        self::STATUS_REJECTED,
        self::STATUS_NOT_FIT,
        self::STATUS_NOT_INTERESTED,
        self::STATUS_NO_VACANCIES,
        self::STATUS_NOT_JOINED,
    ];

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
