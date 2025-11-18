<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\User;
use App\Models\PurchaseScratch;
use App\Models\ScratchCount;

use Validator;

use DataTables;
use Session;
use Auth;
use Log;
use DB;

class UserProfileController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	$user_id=User::getVendorId();

	$scount=ScratchCount::where('fk_int_user_id',$user_id)->pluck('balance_count')->first();
	$usr=User::where('pk_int_user_id',$user_id)->get()->map(function($q)
	{
		  if($q->vchr_logo!="")
			  $q->user_logo=FileUpload::viewFile($q->vchr_logo,'local');
		  else
			  $q->user_logo=asset('assets/images/avatars/1.png');
		  return $q;
	  })->first();

	return view('users.settings.user_profile',compact('scount','usr'));
  }	
  

public function edit($id)
{
	$usr=User::where('pk_int_user_id',$id)->first();
	return view('admin.users.edit_user',compact('usr'));
}


  public function updateUserProfile(Request $request)
    {

        $validator=validator::make($request->all(),[
		'user_name' => 'required|max:25',
        'email' => 'required|email',
        'mobile' => 'required|numeric|digits_between:8,15',
        'designation'=>'required',
		'company'=>'required',
		'location'=>'required'
		]);
        if ($validator->fails()) 
		{
			return response()->json(['msg'=>$validator->messages()->first(),'status'=>false]);
		}
		else
		{
			try{

				$user_id=$request->user_id;
            	
				$data=[
					'vchr_user_name'=>$request->user_name,
					'email'=>$request->email,
					'countrycode'=>$request->country_code,
					'mobile'=>trim($request->mobile),
					'vchr_user_mobile'=>$request->country_code.trim($request->mobile),
					'designation_id'=>$request->designation,
					'company_name'=>$request->company,
					'location'=>$request->location,
					'address'=>$request->address,
				];
						
				$result=User::where('pk_int_user_id',$user_id)->update($data); 
				
				if($result)
        		{   
					return response()->json(['msg'=>'User successfully updated.','status'=>true]);
        		}
        		else
        		{
					return response()->json(['msg'=>'Something wrong, try again.','status'=>false]);
        		}
	
            }
            catch(\Exception $e)
            {
                return response()->json(['msg'=>$e->getMessage(),'status'=>false]);
            }
        } 
    }

public function uploadProfileImage(Request $request)
{
		$file_image= $request->picField;  
        $usr =  User::where('pk_int_user_id',$request->userId)->first();
		if($usr and $usr->vchr_logo!="")
		{
			FileUpload::deleteFile($usr->vchr_logo,'local');
		}			
		
        $file_image= $request->picField;
        $path_list='/user_images/';
        $imgName = mt_rand(). '.' . $file_image->getClientOriginalExtension();
        FileUpload::uploadFile($file_image, $path_list,$imgName,'local');

        $usr->vchr_logo=$path_list.$imgName;                    
        $usr->save();

        return redirect()->back()->with('success', 'Image update successfully!');

}



public function changePassword(Request $request)
{
	
	$validator=validator::make($request->all(),[
		'new_pass' => 'required|max:15',
        'confirm_pass' => 'required|max:15',
        ]);
        if ($validator->fails()) 
		{
			return response()->json(['msg'=>$validator->messages()->first(),'status'=>false]);
		}
		else
		{
	
			$user_id=Auth::user()->pk_int_user_id;
			
			$npas=$request->new_pass;
			$data=['password'=>Hash::make($npas)];
			
			$result=User::where('pk_int_user_id',$user_id)->update($data);
			if($result)
			{   
				return response()->json(['msg'=>'User password updated.','status'=>true]);
			}
			else
			{
				return response()->json(['msg'=>'Something wrong, try again.','status'=>false]);
			}
		}
	
}




}
