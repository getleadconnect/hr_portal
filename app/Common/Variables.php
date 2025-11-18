<?php

namespace App\Common;

use App\Country;
use App\User;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Auth;

class Variables
{
    const ROLE_ADMIN = 1;
    const USER = 2;
    const STAFF = 3;

    const ACTIVE = 1;
    const DEACTIVE = 0;
    const SMS_STATUS_QUEUE = 'Submitted';
    const SMS_STATUS_SENT = 'Sent';
    const SMS_STATUS_FAIL = 'Fail';
    const SMS_STATUS_DELIVERED = 'Delivered';
    const SMS_STATUS_ERROR = 'Error';


    const TELEGRAM_TYPE_PRIVATE = 'private';
    const TELEGRAM_TYPE_GROUP = 'group';
    const NOT_SUBSCRIBED = 'NOT SUBSCRIBED';
    const SUBSCRIBED = 'SUBSCRIBED';
    const EXPIRED = 'EXPIRED';
    const INACTIVE = 'INACTIVE';
    const BOT_TOKEN = '737148201:AAH8K-HgqekcYyfOpNZHsfWQvjl633Cq434';

    const SERVICE_CRM = 'CRM';
    const SERVICE_GLP = 'GL Promo';
    const SERVICE_GLS = 'GL Scratch';
    const SERVICE_GLV = 'GL Verify';
    const SERVICE_MISSEDCALL = 'Missed Call';
    const SERVICE_SMS = 'SMS';
    const SERVICE_IVR = 'IVR';
    const SERVICE_EVENTS = 'GL Events';
    const SERVICE_SALES = 'Sales';
    const SERVICE_CAMPAIGNS = 'Campaigns';

    const BULK_SMS = 'Bulk SMS';
    const DYNAMIC_MESSAGING = 'Dynamic SMS';
    const MESSAGE_VIA_API = 'API';

    const DEF_COUNTRY_INDIA = 29;

    const DYNAMIC_MESSAGE_FIELD_START = 2;
    const DYNAMIC_MESSAGE_FIELD_END = 10;

    /*------------- Bulk SMS Panel--------------------------*/
    const ALERT_BOX = "Alertbox";
    const ALERTBOX = 'AlertBox';
    const MERABT = "Merabt";
    const AWSSNS = "AmazonSNS";
    const TEXT_LOCAL = "TextLocal";
    /*------------- Bulk SMS Panel--------------------------*/

    const GDEAL_DOMAIN = "http://gdeal.getlead.co.uk/";


    const MESSAGE_API = 1;
    const BALANCE_API = 2;
    const STATUS_API = 3;

    const OTP_PRIORITY = 4;
    const INTL_PRIORITY = 5;


    const ALERT_BOX_ER_01 = 'Wrong Username or password.';
    const ALERT_BOX_ER_02 = 'Sorry! Insufficient balance!';
    const ALERT_BOX_ER_03 = 'Sorry! Insufficient balance! Trackid=Sorry! Insufficient balance!';
    const ALERT_BOX_ER_04 = 'Sorry, No valid numbers found!';
    const ALERT_BOX_ER_05 = 'Sorry, No valid numbers found! Trackid=Sorry, No valid numbers found!';
    const ALERT_BOX_ER_06 = 'Sorry, senderid not valid';
    const ALERT_BOX_ER_07 = 'this msg_id is not valid';
    const ALERT_BOX_ER_08 = 'No user found!';

    const  ALERT_BOX_SENT_MESSAGE = 'Your message has been sent';


    const GETLEAD_SERVICES = [self::SERVICE_CRM, self::SERVICE_GLP, self::SERVICE_GLS, self::SERVICE_GLV, self::SERVICE_MISSEDCALL, self::SERVICE_SMS, self::SERVICE_IVR, self::SERVICE_EVENTS, self::SERVICE_SALES, self::SERVICE_CAMPAIGNS];

    const APOLO_USER_ID = 765;
    //const APOLO_USER_ID = 2;
    const BAZANI_USER_ID = 1119;
    const FORTUNE_USER_ID = 1213;
    const NIKSHAN_USER_ID = 1346;
    const EZZAT_USER_ID = 3636;
    

    const BONVOICE_SERVER_2 = [2544,3290,3289,3288,3287,3268,3204,2417,2554];

    const IVR_NUMBER_RESTRICT = [3119];

    const SCARTCH_BYPASS = [3286,3316,1870];

    /**
     * @return mixed
     */
    public function getPermissions()
    {
        return $permissions = Permission::paginate(15);
    }

    /**
     * @param $url
     * @return mixed
     */
    public static function sendData($url)
    {

        $client = new Client();
        $res = $client->get($url);
        return json_decode($res->getBody(), true);
    }

    /**
     * @return mixed
     *
     */
    public static function getCountryList()
    {
        $countries = Country::select('id', 'name')->get();
        return $countries;
    }

    /**
     * @param $date
     * @return string
     * Chnage Date format
     */
    public static function changeDateFormat($date)
    {
        return Carbon::parse($date)->format('M d');
    }

    /**
     * @param $date
     * @return string
     * Change Time format
     */
    public static function changeTimeFormat($date)
    {
        return Carbon::parse($date)->format('g:i A ');
    }

    /**
     * @param $date
     * @return string
     * Get with Year
     */
    public static function dateFormatWithYear($date)
    {
        return Carbon::parse($date)->format('Y M d');
    }

    public static function dateFormatWithYears($date)
    {
        return Carbon::parse($date)->format('M d,Y');
    }

    /**
     * @param $date
     * @return string
     * Get Date String
     */
    public static function dateFormat($date)
    {
        return Carbon::parse($date)->toDateString();

    }

    /**
     * @param $logType
     * @return string
     */
    public static function getLogType($logType)
    {
        switch ($logType) {
            case EnquiryFollowup::TYPE_NOTE:
                return "Note";
                break;
            case EnquiryFollowup::TYPE_LOG_CALL:
                return "Call";
                break;
            case EnquiryFollowup::TYPE_LOG_EMAIL:
                return "Email";
                break;
            case EnquiryFollowup::TYPE_LOG_MEETING;
                return "Meeting";
                break;
            case EnquiryFollowup::TYPE_TASK:
                return "Task";
                break;
            case EnquiryFollowup::TYPE_SCHEDULE:
                return "Schedule";
                break;
            default:
                return "No information available for that day . ";
                break;
        }
    }

    /**
     * @param $id
     * @param $array
     * @param $key
     * @return null
     */
    function searchForService($id, $array, $key)
    {
        foreach ($array as $index => $val) {
            if ($val[$key] === $id) {
                return $val[$key];
            }
        }
        return null;
    }

    /**
     * @param $array
     * @param $service
     * @return null
     */
    public function getGetleadService($array, $service)
    {
        foreach ($array as $index => $sub) {
            if ($sub->plans->services->contains('plan_id', $sub->plans->id)) {
                $sub->user_service = $this->searchForService($service, $sub->plans->services, 'service');
            } else {
                unset($array[$index]);
            }
        }
        return $service_name = $this->searchForService($service, $array, 'user_service');
    }


    public static function checkSubscription($service=null)
    {
        $commonObj = new Common();
        $userSubscription = $commonObj->checkUserSubscription(User::getVendorId(), $service);
        
        if ($userSubscription) {
            return true;
        }
    }

    public static function getSmsRoutes($otp)
    {
        $query = Smsroute::where('int_sms_route_status', Smsroute::ACTIVATE)
            ->where('vchr_sms_route', '!=', Smsroute::EMAIL);
        if ($otp == 0) {
            $query = $query->where('priority', '!=', Variables::OTP_PRIORITY);
        }
        $routes = $query->get();
        return $routes;
    }

    public static function getDesignations()
    {
        return Designation::where('vendor_id', User::getVendorId())->select('pk_int_designation_id', 'vchr_designation')->get();
    }

    public static function getLeadTypes()
    {
        return LeadType::where('vendor_id', User::getVendorId())
            ->select('id', 'name')
            ->get();
    }

    public static function getScratchBypass()
    {
        $settings = Settings::where('vchr_settings_type','scratch-bypass')
        ->select('pk_int_settings_id','vchr_settings_value')->first();
        if($settings){
            return json_decode($settings->vchr_settings_value);
        }else{
            return null;
        }
    }

    public static function checkEnableSettings($label,$vendor_id =null)
    {
        /**
         * Global search = 'global-search'
         * Scratch Bypass = 'scratch-bypass'
         * Branch vise filter = 'branch-filter'
         */
        $settings = Settings::where('vchr_settings_type',$label)->whereJsonContains('vchr_settings_value',$vendor_id ?? User::getVendorId())->select('pk_int_settings_id','vchr_settings_value')->first();
        if($settings){
            return true;
        }else{
            return false;
        }
    }

    public static function checkCurrencyEnableSetting($label)
    {
        $settings = Settings::where('vchr_settings_type',$label)->where('fk_int_user_id',User::getVendorId())->select('pk_int_settings_id','vchr_settings_value')->first();
        if($settings){
            return $settings->vchr_settings_value;
        }
        else
        {
            return null;
        }
    }
}
