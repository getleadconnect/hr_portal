<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\BackendModel\ShortLink;
use App\Http\Controllers\Controller;
use App\User;
use App\BackendModel\ScratchOffers;
use App\BackendModel\ScratchOffersListing;
use App\BackendModel\ScratchCustomers;
use App\BackendModel\EnquiryType;
use App\BackendModel\Enquiry;
use App\Common\SMS;
use App\BackendModel\SendSmsHistory;
use App\BackendModel\Scratchads;
use App\BackendModel\ScratchFooter;
use App\Core\CustomClass;
use App\Common\SingleSMS;
use App\Common\Notifications;
use Illuminate\Http\UploadedFile;
use App\SmsPanel;
use App\BackendModel\ScratchFormCustomisation;
use App\BackendModel\ScratchModel;
use App\BackendModel\ScratchType;
use App\BackendModel\ScratchBranch;
use App\BackendModel\ScratchWebCustomer;
use Validator;
use DataTables;
use Hash;
use App\Common\Variables;
use DB;
use Illuminate\Support\Facades\Input;
use Auth;
use App\CustomField;
use Carbon\Carbon;

use App\Jobs\SendNotification;
use App\ScratchApiUser;
use Log;

class ScratchApiController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function loginApi(Request $request)
    {
    	$input=$request->all();

    	$rule=[ 
	     'username' => 'required',
	     'password'=>'required'
	    ];

	   $validator = validator::make($input,$rule);
    	if ($validator->passes()) 
	    {
	    	try
	    	{
	    		$user = User::where('email', $request->username)
                ->where('int_status', Variables::ACTIVE)
            	->orWhere('vchr_user_mobile', $request->username)
            	->where('int_status', Variables::ACTIVE)
            	->first();
                 $path= url('');

            	if ($user && Hash::check($request->password,$user->password)) {
            		return response()->json(['message'=> 'Logged Successfully','user'=>$user,'path'=>$path, 'status' => 'success']); 
            	}
            	else
            	{
            		return response()->json(['message'=> 'Invalid Login', 'status' => 'fail']); 
            	}
            	
            	

	    	}
	    	catch(\Exception $e)
	    	{
	    		return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
	    	}
	    }
	    else
	    {
	    	return response()->json(['message'=>$validator->messages(), 'status' => 'fail']);
	    }
    }

    public function showLogin()
    {
        
        return view('backend.user-pages.scratch.login');
    }
   

   

   

      public function offersListingApi(Request $request)
    {
    	$input=$request->all();
        //print_r($request->all()); die();
    	$rule=[ 
         'userid' => 'required',
         'campaign_id' =>'required',
         'stage_id' =>'required',
        
	    ];

	   $validator = validator::make($input,$rule);
    	if ($validator->passes()) 
	    {
	    	try
	    	{
                $vendor_id = User::getVendorIdApi($request->userid);
	    		$user = User::where('pk_int_user_id', $vendor_id)
            	->where('int_status', Variables::ACTIVE)
            	->first();
                

            	if ($user) {
                    if($request->billno!="")
                    {
                     $billnoExist = ScratchCustomers::where('vchr_billno', $request->billno)->where('fk_int_user_id', $vendor_id)->first();
                     if($billnoExist)
                     {
                         return response()->json(['message'=> 'Already Scratched', 'status' => 'fail']);
                     }
                     else
                     {
                         $offers = DB::table('tbl_scratch_offers_listing')
                                        ->join('tbl_scratch_offers', 'tbl_scratch_offers.pk_int_scratch_offers_id', '=', 'tbl_scratch_offers_listing.fk_int_scratch_offers_id')
                                        ->where('tbl_scratch_offers.fk_int_user_id',$vendor_id)
                                        ->where('tbl_scratch_offers.int_status','1')
                                        ->where('tbl_scratch_offers.pk_int_scratch_offers_id',$request->campaign_id)      //              
                                        ->where('tbl_scratch_offers_listing.int_scratch_offers_balance','!=','0')
                                        ->where('tbl_scratch_offers_listing.type_id',$request->stage_id)
                                        ->whereNull('tbl_scratch_offers.deleted_at')
                                        ->whereNull('tbl_scratch_offers_listing.deleted_at')
                                        ->inRandomOrder()
                                        ->first();
                                        
                           
                            if($offers){
                                // $flag=ScratchOffersListing::where('pk_int_scratch_offers_listing_id',$offers->pk_int_scratch_offers_listing_id)->get();
                                // return ($flag);
                                $flag=ScratchOffersListing::where('pk_int_scratch_offers_listing_id',$offers->pk_int_scratch_offers_listing_id)->update(['int_scratch_offers_balance'=>$offers->int_scratch_offers_balance-1]);
                                if($flag){
                                    return response()->json(['message'=> 'Offers Listing Successfully','offers'=>$offers, 'status' => 'success']);
                                }else{
                                    return response()->json(['message'=> 'Offer Not Found', 'status' => 'fail']); 
                                }
                            }else{
                                return response()->json(['message'=> 'Offer Not Found', 'status' => 'fail']); 
                            }
        
                     }
                    }
                    else
                    {

                    $offers = DB::table('tbl_scratch_offers_listing')
                            ->join('tbl_scratch_offers', 'tbl_scratch_offers.pk_int_scratch_offers_id', '=', 'tbl_scratch_offers_listing.fk_int_scratch_offers_id')
                            ->where('tbl_scratch_offers.fk_int_user_id',$vendor_id)
                            ->where('tbl_scratch_offers.int_status','1')
                            ->whereNull('tbl_scratch_offers.deleted_at')
                            ->whereNull('tbl_scratch_offers_listing.deleted_at')
                            ->where('tbl_scratch_offers.pk_int_scratch_offers_id',$request->campaign_id)                                
                            ->where('tbl_scratch_offers_listing.type_id',$request->stage_id)                                
                                ->where('tbl_scratch_offers_listing.int_scratch_offers_balance','!=','0')
                            ->inRandomOrder()
                            ->first();
                            if($offers){
                                $flag=ScratchOffersListing::where('pk_int_scratch_offers_listing_id',$offers->pk_int_scratch_offers_listing_id)->update(['int_scratch_offers_balance'=>$offers->int_scratch_offers_balance-1]);
                                
                                return response()->json(['message'=> 'Offers Listing Successfully','offers'=>$offers, 'status' => 'success']);
                            }else{
                                return response()->json(['message'=> 'Offer Not Found', 'status' => 'fail']); 
                            }
                   
                    } 
               }
               else
               {
                  return response()->json(['message'=> 'User Not Found', 'status' => 'fail']); 
              }
            	
            	

	    	}
	    	catch(\Exception $e)
	    	{
	    		return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
	    	}
	    }
	    else
	    {
	    	return response()->json(['message'=>$validator->messages(), 'status' => 'fail']);
	    }
    }

      public function offerApi(Request $request)
    {
        $input=$request->all();
        //print_r($request->all()); die();
        $rule=[ 
         'userid' => 'required',
        ];

       $validator = validator::make($input,$rule);
        if ($validator->passes()) 
        {
            try
            {
                $vendor_id = User::getVendorIdApi($request->userid);
                $user = User::where('pk_int_user_id', $vendor_id)
                ->where('int_status', Variables::ACTIVE)
                ->first();



                if ($user) {
                    $offers =ScratchOffers::where('int_status','1')->where('fk_int_user_id',$vendor_id)->get(); 
                     $path= url('');
                   
                   return response()->json(['message'=> 'Successfully listed','offers'=>$offers,'path'=>$path, 'status' => 'success']);
                }
               else
               {
                  return response()->json(['message'=> 'User Not Found', 'status' => 'fail']); 
              }

            }
            catch(\Exception $e)
            {
                return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
            }
        }
        else
        {
            return response()->json(['message'=>$validator->messages(), 'status' => 'fail']);
        }
    }


    public function addCustomerApi(Request $request)
    {
        
        $input=$request->all();
        // \Log::error($input);
        //print_r($request->all()); die();

        // new field added for hyundai  - message_id

        $rule=[
            'userid' => 'required',
            // 'offerid' => 'required', 
            'campaign_id' => 'required',
            // 'stage_id' => 'required',
            'name' => 'required',
            'mobileno' => 'required|numeric|digits_between:8,14',
            'type_id'=>'required',
            // 'dob'=>'required',
            // 'billno'=>'required',
        ];
        $vendor_id = User::getVendorIdApi($request->userid);
        $user = User::where('pk_int_user_id', $vendor_id)
                ->where('int_status', Variables::ACTIVE)
                ->first();
        if ($user && $request->type) {
            try{
                $someObject=json_decode($request->extrafield_values);
                $additional_fields=[];
                if(is_array($someObject)){
                    foreach($someObject as $key=>$someObject1)  
                    { 
                    $additional_fields[$someObject[$key]->label] = $someObject[$key]->value;
                    }
                }
                else{
                    $additional_fields=$someObject;
                }
                $request->merge((array)$additional_fields);
                $rule= CustomField::validations($request->userid,$request->type,$rule);
            }
            catch(\Exception $e){
                \Log::info('GL Scratch ExtraFields Error');
                \Log::info($e->getMessage());
            }
        }
       $validator = validator::make($request->all(),$rule);
        if ($validator->passes()) 
        {
            try
            {
                // if($request->type && !$request->type_id)
                //     $request->merge([
                //         'type_id' => $request->type
                //     ]);
                $user = User::where('pk_int_user_id', $vendor_id)
                ->where('int_status', Variables::ACTIVE)
                ->first();
                if ($user) 
                {
                    do {
                        $uniqueId = 'GA' . strtoupper(substr(uniqid(), 8));
                        $unique_flag = ScratchCustomers::where('unique_id', $uniqueId)->exists();
                    } while ($unique_flag);
                    if($request->type_id==1)
                        $offersListing = ScratchOffersListing::where('pk_int_scratch_offers_listing_id',$request->offerid)
                        ->first();
                    else
                        $offersListing = ScratchOffers::find($request->campaign_id);
                   if($request->billno!="" && $request->type_id==1)
                   {
                     $billnoExist = ScratchCustomers::where('vchr_billno', $request->billno)->where('fk_int_user_id',$vendor_id)
                     ->first();
                     
                     if($billnoExist)
                     {
                         return response()->json(['message'=> 'Bill Number  is Already Used', 'status' => 'fail']);
                     }
                     else
                        {
                         if($offersListing)
                         {
                            $customers=new ScratchCustomers();
                            $customers->fk_int_user_id=$vendor_id;
                            $customers->unique_id = $uniqueId;
                            $customers->vchr_name=$request->name;
                            $customers->vchr_mobno=$request->mobileno;
                            // $customers->vchr_dob=$request->dob;
                            $customers->vchr_billno=$request->billno;
                            $customers->fk_int_offer_id=$request->offerid;
                            $customers->int_status="0";
                            $customers->extrafield_values=$request->extrafield_values;
                            $customers->email=$request->email;
                            $customers->type_id=$request->stage_id;
                            $customers->branch_id=$request->branch_id;
                            $customers->campaign_id=$request->campaign_id;
                            $customers->offer_text=$offersListing->txt_description;
                            $flag=$customers->save();
                            if($request->extrafield_values){
                                try{
                                    if($request->type==='enquiryFollowup_glScratch')
                                    {
                                        $client = new \GuzzleHttp\Client();
                                        $client_url = "https://connect.pabbly.com/workflow/sendwebhookdata/Ijg5NzYi";
                                        $dealer = User::select('vchr_user_name')->find($vendor_id);
                                        $request->merge([
                                            'dealer'=>$dealer->vchr_user_name,
                                            'gift' => $offersListing->txt_description
                                            ]);
                                        $client_body = [
                                            "Sl_No"=> '=row()-1',
                                            "Ref_Id" => (string)$customers->pk_int_scratch_customers_id,
                                            "Dealer" => $dealer->vchr_user_name,
                                            "Retailer" => $additional_fields['retailer'],
                                            "Customer_Name" => (string)$customers->vchr_name,
                                            "Mobile_Number" => (string)$customers->vchr_mobno,
                                            "VIN" => $additional_fields['vehicle_number'],
                                            "Model" => $additional_fields['model'],
                                            "Gift" => $offersListing->txt_description,
                                            "Date" => Carbon::now()->format('Y-m-d'),
                                            "Time" => Carbon::now()->format('g:i A')
                                        ];
                                        // \Log::info($client_body);
                                        $client_request = $client->post($client_url,  ['form_params'=>$client_body]);
                                        
                                        $request->merge((array)$additional_fields);
                                    }
                                    
                                }
                                catch(\Exception $e){
                                    \Log::info('GL Scratch ExtraFields Error');
                                    \Log::info($e->getMessage());
                                }
                            }
                           // Enquiry::getCRMUsers(EnquiryType::GLSCRATCH,$request->mobileno,$vendor_id);
                            if (!$request->has('status') && !$request->filled('status')) {
                                $request->merge([
                                    'status' => 'New'
                                ]);
                            }
                            Enquiry::getCRMWebsiteUsers(EnquiryType::GLSCRATCH,$request->mobileno,$vendor_id,$request->name,'','',$request->country_code,'',$request);

                            $balance=$offersListing->int_scratch_offers_balance;
                            $actualBalance=$balance-1;

                            // DB::table('tbl_scratch_offers_listing')
                            // ->where('pk_int_scratch_offers_listing_id', $request->offerid)
                            // ->update(['int_scratch_offers_balance' => $actualBalance]);

                           

                            $getOffers=ScratchOffersListing::where('pk_int_scratch_offers_listing_id', $request->offerid)->where('int_winning_status', '1')
                            ->first();
                           if($getOffers)
                           {

                            //Send Sms
                            //    $message="Congratulations!! You have won".' '.$getOffers->txt_description;
                            $template = User::getModuleSmsTemplate($vendor_id,2,1);
                            if($template)
                            // {
                                $message = str_replace(['{offer}','{redeem_id}'],[$getOffers->txt_description,$customers->pk_int_scratch_customers_id],$template->template);
                            // }
                            else
                            // {
                               
                            //     if($request->message_id==1)  //for hyundai
                            //     {
                            //         $message='Congratulations! You have won a '. $getOffers->txt_description.'  as a part of Hyundai lucky draw.Your redeem id is '.$customers->pk_int_scratch_customers_id.'.Getlead';
                            //     }
                            //     else
                            //     {
                            //         $message='Congratulations!! You have won ' . $getOffers->txt_description . '.And Your Redeem Id is ' . $customers->pk_int_scratch_customers_id.'. Getlead';
                            //     }
                            // }
                            $message='Congratulations!! You have won ' . $getOffers->txt_description . '.And Your Redeem Id is ' . $customers->pk_int_scratch_customers_id.'. Getlead';
                           /// $message='Congratulations! You have won a '.$getOffers->txt_description.' as a part of Hyundai lucky draw.Your redeem id is '.$customers->pk_int_scratch_customers_id.'.Getlead';
                                // \Log::info($message);
                            $defaultSenderId=SingleSMS:: getSenderid($vendor_id,EnquiryType::GLSCRATCH);
                               $defaultRoute=SingleSMS:: getRoute($vendor_id,EnquiryType::GLSCRATCH);
                               $apitemplate=CustomClass::userDefaultApiTemplate($vendor_id);
                                    if(!empty($apitemplate))
                                    {
                                        $input['template_id']=$apitemplate->pk_int_api_template_id;
                                        $input['template']=$apitemplate->text_api_template_description;
                                        $response=CustomClass::urlReplacement($input['template'],$message,$request->mobileno,$defaultSenderId);
                                               
                                    }
                                    else
                                    {
                                         $send=new SingleSMS();
                                        $smsPanel=$send->getSmsPanel($defaultRoute,$vendor_id);
                                        $balanceSms=$send->getSMSBalance($vendor_id,$defaultRoute,$smsPanel);
                                        if($balanceSms>0)
                                        {
                                            if($smsPanel->title==SmsPanel::ALERTBOX)
                                            {
                                                $routeCode=$send->getRouteDetails($defaultRoute)->int_sms_route_code;
                                                $smsUrl=$send->getSmsUrl($defaultSenderId, $request->mobileno, $message, $defaultRoute,$routeCode,$vendor_id,'0');
                                                $smsCount=$send->getInputSMSCount($message, '0');
                                                $templateId=$send->getSmsTemplateId($defaultRoute,$vendor_id);
                                                $routeName=$send->getRouteDetails($defaultRoute)->vchr_sms_route;
                                                $insertSms=$send->storeSmsData($vendor_id,$templateId,$request->mobileno,$defaultSenderId,'0',$routeName,$message,EnquiryType::GLSCRATCH,$routeCode,$defaultRoute,'1',$smsCount);
                                                    $response = $send->sendSms($defaultSenderId, $request->mobileno, $message, $routeCode,$balanceSms,$templateId,$defaultRoute,'0',$vendor_id,$smsUrl);

                                                $response=$send->getResponse($insertSms,$response,$templateId,$defaultRoute,$vendor_id,$smsCount);
                                            }elseif ($smsPanel->title == SmsPanel::TEXT_LOCAL) {
                                                $userId=$vendor_id;
                                                $routeDetails=$send->getRouteDetails($defaultRoute);
                                                $routeCode = $send->getRouteDetails($defaultRoute)->int_sms_route_code;
                                                $textLocalCredentials = $send->getTextLocalCredentials($userId, $routeDetails->pk_int_sms_route_id, $smsPanel->id);
                                                $apiKey = $textLocalCredentials->api_password;
                                                $numbers = $request->mobileno;
                                                $explodeTo=[$numbers];
                                                $countMobileno = 1;
                                                $request->message = $message;
                                                $data = $send->getTextLocalSmsUrl($defaultSenderId, $message, $apiKey, $numbers);
                                                $getTextLocalSmsUrl = $smsPanel->domain . '/send?' . $data;
                
                                                $templateId = $textLocalCredentials->id;
                                                $routeName = $send->getRouteDetails($routeDetails->pk_int_sms_route_id)->vchr_sms_route;
                                                $messageType=0;
                                                $messageCount = $send->getInputSMSCount($message,$messageType);
                                                $insertMasterSms = $send->storeMasterSmsDataDeveloperApi($vendor_id, $templateId, '', $defaultSenderId, $messageType, $routeName, $message, EnquiryType::GLSCRATCH, $routeCode, $routeDetails->pk_int_sms_route_id, $countMobileno, $messageCount);
                                                $TextLocalResponses = $send->sendData($getTextLocalSmsUrl);
                                                $textLocalResponse = json_decode($TextLocalResponses, true);
                                                $shtime = 0;
                                                foreach ($explodeTo as $i => $numb) {
                                                    $mobno = $numb;
                                                    $smsHistoryId = $send->storeSmsDataDeveloperApi($vendor_id, $templateId, $mobno, $defaultSenderId, $messageType, $routeName, $message, EnquiryType::GLSCRATCH, $routeCode, $routeDetails->pk_int_sms_route_id, $countMobileno, $messageCount, $insertMasterSms, $TextLocalResponses, $shtime);
                                                    if ($textLocalResponse['status'] === "failure") {
                                                        $message = $textLocalResponse['errors'][0]['message'];
                                                        $send->updateTextLocalResponse($smsHistoryId, $TextLocalResponses, Variables::SMS_STATUS_FAIL, $routeDetails->pk_int_sms_route_id);
                                                       
                                                    } elseif ($textLocalResponse['status'] === "success") {
                
                                                        $send->updateTextLocalResponse($smsHistoryId, $TextLocalResponses, Variables::SMS_STATUS_DELIVERED, $routeDetails->pk_int_sms_route_id);
                                                    }
                                                }
                                                $masterSmsDetails = $send->getMasterSmsDetails($insertMasterSms);
                                            }                
                                            else
                                            {
                                                $routeCode=$send->getRouteDetails($defaultRoute)->short_code;
                                                $smsUrl=$send->getSmsMerabtUrl($defaultSenderId, $request->mobileno, $message, $defaultRoute,$routeCode,$vendor_id,'0');
                                                $smsCount=$send->getInputSMSCount($message, '0');
                                                $templateId=$send->getSmsTemplateId($defaultRoute,$vendor_id);
                                                $routeName=$send->getRouteDetails($defaultRoute)->vchr_sms_route;
                                                $insertSms=$send->storeSmsData($vendor_id,$templateId,$request->mobileno,$defaultSenderId,'0',$routeName,$message,EnquiryType::GLSCRATCH,$routeCode,$defaultRoute,'1',$smsCount);
                                            //    $response = $send->sendSms($defaultSenderId, $request->mobileno, $message, $routeCode,$balance,$templateId,$defaultRoute,'0',$vendor_id,$smsUrl);
                                                $response = $send->sendSmsPost($defaultSenderId, $request->mobileno, $message, $routeCode, $balance, $templateId, $defaultRoute, '0', $vendor_id);
                                                $response=$send->getMetabtResponse($insertSms,$response,$templateId,$defaultRoute,$vendor_id,$smsCount);
                                            }
                                        }
                                    }
                            //   \Log::info("Hyundai");
                                    // \log::info($response);

                               //End Send Sms-------------------------------------
                            }
                            if($request->branch_id){
                                $branch = ScratchBranch::find($request->branch_id);
                                $branch_name = $branch ? $branch->branch : '';
                            }
                            else{
                                $branch_name = '';
                            }
                                $userObject = User::getUserDetails($vendor_id);
                                $userAdminObject = User::getSingleAdminDetails();
                                //Notifications-------------
                                $notifications=new Notifications();
                                $from=env('MAIL_FROM_ADDRESS');
                                $to=$userObject->email;
                                $subject="GL Scratch Notifications";
                                $name=$userObject->vchr_user_name;
                                $logo=$userAdminObject->vchr_logo;
                                $attachment="";
                                $telegramId=$userObject->telegram_id;
                                $mobileNumber=$userObject->vchr_user_mobile;
                                $defaultSenderIdAdmin=SingleSMS:: getSenderid($userAdminObject->pk_int_user_id,'');
                                $defaultRouteAdmin=SingleSMS:: getRoute($userAdminObject->pk_int_user_id,'');
                                // $content1="New Leads via GL Scratch- ".$input['mobileno']."";
                                // $content2="You have new leads via GL Scratch- ".$input['mobileno']."";
                                $content1 = "🔅 Hey, You Have Got a New Lead via Digital Scratch Card. 🔅 

Customer Name : ".$request->name." 
Customer Number : " . $input['mobileno'] . "
Bill Number : ".$request->billno."
Branch Name : ".$branch_name."
Date and Time : " . Carbon::now();
                                $content2 = $content1;
                                $dataSend['message'] = $content1;
                                $dataSend['user_id'] = $request->userid;
                                $dataSend['page'] = 'scratch';
                                 $notifications->notifications($from,$to,$subject,$name,$content1,$content2,$logo,$attachment,$telegramId,$vendor_id,$mobileNumber,$defaultRouteAdmin,$defaultSenderIdAdmin,$dataSend);

                                //-----------------
                           //Automation
                            /**--API---------------------------------------------**/
                            $automation_api = \App\AutomationRule::where('vendor_id', $vendor_id)
                            ->where('trigger', $request->type_id==1 ? 'new_scratch' : 'new_luckydraw')
                            ->where('action', 'api')
                            ->orderBy('id', 'DESC')
                            ->first();

                            if ($automation_api) {
                                $api=$automation_api->api;
                                $url= str_replace(["{number}","{redeem_id}","{name}","{bill_no}"],[$request->mobileno,$uniqueId,$request->name,$request->billno],$api);
                                $client = new \GuzzleHttp\Client();
                                $client_request = $client->get($url);
                                // \Log::info("Scratch Automation API Call");
                                // \Log::info($client_request->getBody());
                            }
                            /**--API---------------------------------------------**/
                            //

                            return response()->json(['message'=> 'Customer details added successfully', 'status' => 'success']);
                        }
                        else
                        {
                           return response()->json(['message'=> 'No Offers Available', 'status' => 'fail']);
                        } 
                        }
                    }
                    else
                    {
                      if($offersListing)
                         {
                            // $custExist = ScratchCustomers::where('vchr_mobno', $request->mobileno)->where('fk_int_user_id',User::getVendorIdApi($request->userid))
                            // ->where('campaign_id',$request->campaign_id)->first();
                            
                            // if($custExist)
                            // {
                            //     return response()->json(['message'=> 'Mobile Number  is Already Used', 'status' => 'fail']);
                            // }
                            $customers=new ScratchCustomers();
                            $customers->unique_id = $uniqueId;
                            $customers->fk_int_user_id=$vendor_id;
                            $customers->vchr_name=$request->name;
                            $customers->vchr_mobno=$request->mobileno;
                            $customers->vchr_dob=$request->dob;
                            $customers->vchr_billno=$request->billno;
                            $customers->fk_int_offer_id=$request->offerid;
                            $customers->type_id=$request->stage_id;
                            $customers->branch_id=$request->branch_id;
                            $customers->campaign_id=$request->campaign_id;
                            $customers->int_status="0";
                            $customers->extrafield_values=$request->extrafield_values;
                            $customers->email=$request->email;
                            $flag=$customers->save();
                          // Enquiry::getCRMUsers(EnquiryType::GLSCRATCH,$request->mobileno,User::getVendorIdApi($request->userid));
                            if (!$request->has('status') && !$request->filled('status')) {
                                $request->merge([
                                    'status' => 'New'
                                ]);
                            }
                            Enquiry::getCRMWebsiteUsers(EnquiryType::GLSCRATCH,$request->mobileno,$vendor_id,$request->name,'','',$request->country_code,'',$request);
                            if($request->type_id==1){
                            $balance=$offersListing->int_scratch_offers_balance;
                            $actualBalance=$balance-1;

                            DB::table('tbl_scratch_offers_listing')
                            ->where('pk_int_scratch_offers_listing_id', $request->offerid)
                            ->update(['int_scratch_offers_balance' => $actualBalance]);

                            //Sms

                            $getOffers=ScratchOffersListing::where('pk_int_scratch_offers_listing_id', $request->offerid)->where('int_winning_status', '1')
                            ->first();
                            if($getOffers)
                            {
                                //Send SMS
                                $message="Congratulations!!You have won".' '.$getOffers->txt_description;
                               $defaultSenderId=SingleSMS:: getSenderid($vendor_id,EnquiryType::GLSCRATCH);
                               $defaultRoute=SingleSMS:: getRoute($vendor_id,EnquiryType::GLSCRATCH);
                               $apitemplate=CustomClass::userDefaultApiTemplate($vendor_id);
                                    if(!empty($apitemplate))
                                    {
                                        $input['template_id']=$apitemplate->pk_int_api_template_id;
                                        $input['template']=$apitemplate->text_api_template_description;
                                        $response=CustomClass::urlReplacement($input['template'],$message,$request->mobileno,$defaultSenderId);
                                               
                                    }
                                    else
                                    {
                                        $send=new SingleSMS();
                                        $smsPanel=$send->getSmsPanel($defaultRoute,$vendor_id);
                                        $balanceSms=$send->getSMSBalance($vendor_id,$defaultRoute,$smsPanel);
                                        if($balanceSms>0)
                                        {
                                            if($smsPanel->title==SmsPanel::ALERTBOX)
                                            {
                                                $routeCode=$send->getRouteDetails($defaultRoute)->int_sms_route_code;
                                                $smsUrl=$send->getSmsUrl($defaultSenderId, $request->mobileno, $message, $defaultRoute,$routeCode,$vendor_id,'0');
                                                $smsCount=$send->getInputSMSCount($message, '0');
                                                $templateId=$send->getSmsTemplateId($defaultRoute,$vendor_id);
                                                $routeName=$send->getRouteDetails($defaultRoute)->vchr_sms_route;
                                                $insertSms=$send->storeSmsData($vendor_id,$templateId,$request->mobileno,$defaultSenderId,'0',$routeName,$message,EnquiryType::GLSCRATCH,$routeCode,$defaultRoute,'1',$smsCount);
                                                    $response = $send->sendSms($defaultSenderId, $request->mobileno, $message, $routeCode,$balanceSms,$templateId,$defaultRoute,'0',$vendor_id,$smsUrl);

                                                $response=$send->getResponse($insertSms,$response,$templateId,$defaultRoute,$vendor_id,$smsCount);
                                            }
                                            else
                                            {
                                                $routeCode=$send->getRouteDetails($defaultRoute)->short_code;
                                                $smsUrl=$send->getSmsMerabtUrl($defaultSenderId, $request->mobileno, $message, $defaultRoute,$routeCode,$vendor_id,'0');
                                                $smsCount=$send->getInputSMSCount($message, '0');
                                                $templateId=$send->getSmsTemplateId($defaultRoute,$vendor_id);
                                                $routeName=$send->getRouteDetails($defaultRoute)->vchr_sms_route;
                                                $insertSms=$send->storeSmsData($vendor_id,$templateId,$request->mobileno,$defaultSenderId,'0',$routeName,$message,EnquiryType::GLSCRATCH,$routeCode,$defaultRoute,'1',$smsCount);
                                                $response = $send->sendSms($defaultSenderId, $request->mobileno, $message, $routeCode,$balance,$templateId,$defaultRoute,'0',$vendor_id,$smsUrl);
                                              


                                                                    
                                                $response=$send->getMetabtResponse($insertSms,$response,$templateId,$defaultRoute,$vendor_id,$smsCount);
                                            }
                                        }
                                    }
                                //End Send SMS-----------------------------------------
                            }
                            }
                            if($request->branch_id){
                                $branch = ScratchBranch::find($request->branch_id);
                                $branch_name = $branch ? $branch->branch : '';
                            }
                            else{
                                $branch_name = '';
                            }
                            //Notifications-------------
                                $userObject = User::getUserDetails($vendor_id);
                                $userAdminObject = User::getSingleAdminDetails();
                                $notifications=new Notifications();
                                $from=env('MAIL_FROM_ADDRESS');
                                $to=$userObject->email;
                                $subject="GL Scratch Notifications";
                                $name=$userObject->vchr_user_name;
                                $logo=$userAdminObject->vchr_logo;
                                $attachment="";
                                $telegramId=$userObject->telegram_id;
                                $mobileNumber=$userObject->vchr_user_mobile;
                                $defaultSenderIdAdmin=SingleSMS:: getSenderid($userAdminObject->pk_int_user_id,'');
                                $defaultRouteAdmin=SingleSMS:: getRoute($userAdminObject->pk_int_user_id,'');
                                // $content1="New Leads via GL Scratch- ".$input['mobileno']."";
                                // $content2="You have new leads via GL Scratch- ".$input['mobileno']."";
                                $content1 = "🔅 Hey, You Have Got a New Lead via Digital Scratch Card. 🔅 

Customer Name : ".$request->name." 
Customer Number : " . $input['mobileno'] . "
Bill Number : ".$request->billno."
Branch Name : ".$branch_name."
Date and Time : " . Carbon::now();
                                $content2 = $content1;
                                 $notifications->notifications($from,$to,$subject,$name,$content1,$content2,$logo,$attachment,$telegramId,$vendor_id,$mobileNumber,$defaultRouteAdmin,$defaultSenderIdAdmin);
                                //-----------------
                            //Automation
                            /**--API---------------------------------------------**/
                            $automation_api = \App\AutomationRule::where('vendor_id', $vendor_id)
                            ->where('trigger', $request->type_id==1 ? 'new_scratch' : 'new_luckydraw')
                            ->where('action', 'api')
                            ->orderBy('id', 'DESC')
                            ->first();

                            if ($automation_api) {
                                $api=$automation_api->api;
                                $url= str_replace(["{number}","{redeem_id}","{name}","{bill_no}"],[$request->mobileno,$uniqueId,$request->name,$request->billno],$api);
                                $client = new \GuzzleHttp\Client();
                                $client_request = $client->get($url);
                                // \Log::info("Scratch Automation API Call");
                                // \Log::info($client_request->getBody()); 
                            }
                            /**--API---------------------------------------------**/
                            //
                            return response()->json(['message'=> 'Customer details added successfully', 'status' => 'success']);
                        }
                        else
                        {
                           return response()->json(['message'=> 'No Offers Available', 'status' => 'fail']);
                        }  
                    }
                }
               else
                {
                  return response()->json(['message'=> 'User Not Found', 'status' => 'fail']); 
                }
            }
            catch(\Exception $e)
            {
                \Log::info("Scratch API Error");
                // \Log::info($request->all());
                \Log::info($e->getMessage());
                // \Log::info($e->getTraceAsString());
                return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
            }
        }
        else
        {
            return response()->json(['message'=>$validator->messages(), 'status' => 'fail']);
        }
    }

    public function showOffersListing()
    {
        
        return view('backend.user-pages.scratch.offer.offerslisting');
    }
    public function showCustomers()
    {
        
        return view('backend.user-pages.scratch.customers');
    }

     public function showOffers($id)
    {
        $offers=ScratchOffers::find($id);
        if($offers)
        {
              return response()->json(['msg' => "Offer detail found.", 'status' => 'success', 'data' => $offers]);
        }
        else {
            return response()->json(['msg' => "Offer detail not found.", 'status' => 'fail']);
        }

    }

    

   
    public function adApi(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
             $path= url('');
            $ads = Scratchads::
                where('status', Scratchads::ACTIVE)
                ->where('user_id', $userid)
                ->get();
            return response()->json(['message'=> 'Successfully listed','ads'=>$ads,'path'=>$path, 'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }

    public function clientLogoApi(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
             $path= url('');
            $user = User::
                where('pk_int_user_id', $userid)
               ->get();
            return response()->json(['message'=> 'Successfully listed','user'=>$user,'path'=>$path, 'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }


    public function typeApi(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
       'campaign_id' => 'required'
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
                 $type = ScratchType::where('scratch_type.vendor_id', $userid)->where('scratch_type.status',ScratchType::ACTIVATE)
                                        // ->join('tbl_scratch_offers','tbl_scratch_offers.type_id','scratch_type.id')
                                        // ->where('tbl_scratch_offers.int_status',ScratchOffers::ACTIVATE)
                                        // ->join('tbl_scratch_offers_listing','tbl_scratch_offers_listing.fk_int_scratch_offers_id','tbl_scratch_offers.pk_int_scratch_offers_id')
                                        ->join('tbl_scratch_offers_listing','tbl_scratch_offers_listing.type_id','scratch_type.id')
                                        ->where('tbl_scratch_offers_listing.int_status',ScratchOffersListing::ACTIVATE)
                                        ->where('tbl_scratch_offers_listing.int_scratch_offers_balance','>','0')
                                        ->join('tbl_scratch_offers','tbl_scratch_offers.pk_int_scratch_offers_id','tbl_scratch_offers_listing.fk_int_scratch_offers_id')
                                        ->where('tbl_scratch_offers.int_status',ScratchOffers::ACTIVATE)
                                        ->where('tbl_scratch_offers_listing.fk_int_scratch_offers_id',$request->campaign_id)
                                        ->whereNull('tbl_scratch_offers.deleted_at')
                                        ->whereNull('tbl_scratch_offers_listing.deleted_at')
                                        ->whereNull('scratch_type.deleted_at')
                                        
                                        // ->join('scratch_type','scratch_type.id','tbl_scratch_offers.type_id')
                                        ->select('scratch_type.id','scratch_type.type')->groupBy('id')
                                        ->get();
            
        //   $type = ScratchType::where('vendor_id', $userid)->where('status',ScratchType::ACTIVATE)
        //        ->get();
            
            if($type->isEmpty()){
                return response()->json(['message'=> 'No Offer Available Now ...','status' => 'fail','user'=>$type]);
            }
            
            return response()->json(['message'=> 'Successfully listed','user'=>$type,'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }
    public function branchApi(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
                 $branches = ScratchBranch::where('scratch_branches.vendor_id', $userid)->where('scratch_branches.status',ScratchBranch::ACTIVATE)
                                        
                                        ->select('scratch_branches.id','scratch_branches.branch')->groupBy('id')
                                        ->get();
            
        
            if($branches->isEmpty()){
                return response()->json(['message'=> 'No Branches Available Now ...','status' => 'fail','branches'=>$branches]);
            }
            
            return response()->json(['message'=> 'Successfully listed','branches'=>$branches,'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }
     public function footerApi(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {

            $footer = ScratchFooter::
                where('vendor_id', $userid)
               ->first();
               if($footer)
                {
                    return response()->json(['message'=> 'Successfully listed','footer'=>$footer, 'status' => 'success']);
                }
                else
                {
                    $addFooter=new ScratchFooter();
                    $addFooter->vendor_id=$userid;
                    $addFooter->content="Powered By Getlead";
                    $addFooter->save();
                    $footers = ScratchFooter::
                        where('vendor_id', $userid)
                       ->first();
                   return response()->json(['message'=> 'Successfully listed','footer'=>$footers, 'status' => 'success']);

                }
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }

    public function showFooter()
    {
        
        return view('backend.user-pages.scratch.footer');
    }

     public function getScratchFooter()
    {
      $id=User::getVendorId();
      //return $id;
      $footers = ScratchFooter::where('vendor_id',$id)->get();
        //print_r($id); die();
        foreach ($footers as $key => $row) {
                    $row->slno=++$key;
                }
        return Datatables::of($footers)
        ->editColumn('name', function ($footers) {
            if ($footers->content != null) {
                return $footers->content;
            } else {
                return "No Offers Found";
            }
        })
        
         ->addColumn('show', function ($footers) 
        {
            
                return '
                <button feedback-id="' . $footers->id . '" class="btn btn-sm btn-primary mg-b-10 ks-izi-modal-trigger1" data-target="#ks-izi-modal-large1"  data-toggle="modal" title="edit"> <i class="fa fa-edit mg-r-5"></i></button>
                
                ';
            
            
        })

        ->rawColumns(['show'])
        ->toJson(true);
    }

     public function showFooters($id)
    {
        $footer=ScratchFooter::find($id);
        if($footer)
        {
              return response()->json(['msg' => "Offer detail found.", 'status' => 'success', 'data' => $footer]);
        }
        else {
            return response()->json(['msg' => "Offer detail not found.", 'status' => 'fail']);
        }

    }

     public function editScratchFooters(Request $request,$id)
    {
        $input = $request->all();
        $validator = validator::make($input, ScratchFooter::$rule, ScratchFooter::$message);
       if ($validator->passes()) {
            try {
                $footer = ScratchFooter::find($id);
                $footer->content = $input['content'];
                $flag=$footer->save();
                
                if ($flag) {
                    return response()->json(['msg' => 'Footer updated.', 'status' => 'success']);
                } else {
                    return response()->json(['msg' => 'Something went wrong, please try again later.', 'status' => 'fail']);
                }

            } catch (\Exception $e) {
                return response()->json(['msg' => $e->getMessage(), 'status' => 'fail']);

                //return $e->getMessage();
            }

        } else {
            return response()->json(['msg' => $validator->messages(), 'status' => 'fail']);

           
        }
    }

    public function showScratchAdApi()
    {
        
        return view('backend.user-pages.scratch.scratch-ad-api');
    }
    public function showScratchFormCustomisation()
    {
        
        return view('backend.user-pages.scratch.form-customisation-api');
    }

    public function formCustomisation(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
            $form = ScratchFormCustomisation::
                where('vendor_id', $userid)
               ->first();
            return response()->json(['message'=> 'Successfully listed','data'=>$form, 'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }


    public function scratchModel(Request $request)
    {
      $input=$request->all();
      $userid=User::getVendorIdApi($request->userid);
              //print_r($request->all()); die();
      $rule=[ 
       'userid' => 'required',
     ];

     $validator = validator::make($input,$rule);
     if ($validator->passes()) 
     {
        try
        {
            $model = ScratchModel::
                where('status', ScratchModel::ACTIVE)
                ->where('vendor_id', $userid)
                ->get();
            return response()->json(['message'=> 'Successfully listed','data'=>$model, 'status' => 'success']);
        }
        catch(\Exception $e)
        {
            return response()->json(['message'=>$e->getMessage(), 'status' => 'fail']);
        }
      } 
      else 
      {
             
        return response()->json(['msg'=>$validator->messages(), 'status' => 'fail']);
      }

    }
    public function scratchModelApi()
    {
        
        return view('backend.user-pages.scratch.scratch-model-api');
    }

    public function scratchWithoutOtp()
    {
        $check_num = ScratchWebCustomer::where('bill_no',request('bill_no'))->first();
        if($check_num){
            return response()->json(['status' => false, 'id' => null,'unique_id'=>null,'message'=>'Bill Number  is Already Used']);
        }

        $user_id = DB::table('tbl_gl_api_tokens')->where('vchr_token',request('apikey'))->pluck('fk_int_user_id')->first();   
        $customer = new ScratchWebCustomer();
        $customer->status = ScratchWebCustomer::NOT_SCRATCHED;
        $customer->redeem = ScratchWebCustomer::NOT_REDEEMED;
        $customer->email = request()->email;
        $customer->name = request()->name;
        $customer->api_key = request()->apikey;
        $customer->mobile = request()->mobile;
        $customer->country_code = request()->country_code;
        $customer->user_id =  $user_id;
        $offerListing = ScratchOffersListing::where('fk_int_scratch_offers_id', request()->offer_id)->where('int_scratch_offers_balance', '!=', '0')->inRandomOrder()->first();
        if ($offerListing) {
            do {
                $uniqueId = 'GW' . strtoupper(substr(uniqid(), 8));
                $unique_flag = ScratchWebCustomer::where('unique_id', $uniqueId)->exists();
            } while ($unique_flag);
            $customer->unique_id = $uniqueId;
            $customer->offer_list_id = $offerListing->pk_int_scratch_offers_listing_id;
            $customer->offer_text = $offerListing->txt_description;
            $offerListing->save();
            $customer->bill_no = request()->bill_no;
            $customer->amount = request()->amount;
            $customer->save();
            $offerListing->customer_id = $customer->id;
            $offerListing->uniqueId = $uniqueId;
            $offerListing->link = 'http://'.env('SHORT_LINK_DOMAIN').'/wa/'.$uniqueId;
        try {
            $url = 'https://app.getlead.co.uk/api/pushsms?username=918453555000&token=gl_d52aa6241238b4e44d9b&sender=GTLEAD&to='.request()->mobile.'&message=Congratulations!!%20You%20have%20won%20a%20Scratch%20card.%20And%20Your%20Redeem%20Id%20is%20http://gl1.in/wa/'.$uniqueId.' .%20Getlead&priority=11&message_type=0';
            $client = new \GuzzleHttp\Client();
            $client_request = $client->get($url);    
        } catch (\Throwable $th) {
            return response()->json(['status' => true, 'offerListing' => [],'message'=>'Link not send']);
        }    
        
            return response()->json(['status' => true, 'offerListing' => $offerListing]);
        }else{
            return response()->json(['msg' => "Offer is Invalid", 'status' => false]);
        }
    }
}   