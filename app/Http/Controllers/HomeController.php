<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\Application;
use App\Models\JobCategory;
use App\Services\ApiService;

use Validator;
use Session;
use Auth;
use Log;
use DB;


class HomeController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	  $job_cat=JobCategory::where('status',1)->get();
	 return view('hr_form_new',compact('job_cat'));
  }	
      
  public function store(Request $request)
    {
		
		//https://instisuite.sgp1.digitaloceanspaces.com/Resume-Getlead/shaji_testing_111743157622.png
		  			
		DB::beginTransaction();
		try
		{

			$path = 'Resume-Getlead';
			
			$photo="";
			$cv_file="";

			$nam=str_replace(' ','_',$request->first_name);
			
			if($request->file('photo'))
			{ 
				$image = $request->file('photo');
				$photo = $nam."_".rand(10, 100). date_timestamp_get(date_create()). '.' . $image->getClientOriginalExtension();
				$fname1=Storage::disk('spaces')->putFileAs("Resume-Getlead",$request->file('photo'),$photo, 'public');
			}
			
			if($request->file('cv_file'))
			{ 
				$imageMobile = $request->file('cv_file');
				$cvfile = $nam."_".rand(10, 100). date_timestamp_get(date_create()). '.' . $imageMobile->getClientOriginalExtension();
				$fname2=Storage::disk('spaces')->putFileAs("Resume-Getlead",$request->file('cv_file'),$cvfile,'public');
			}	

			$dob=$request->year."-".$request->month."-".$request->day;
			
			$data=[
				'name'=>$request->first_name,
				'photo'=>$fname1,
				'dob'=>$dob,
				'technology_stack'=>$request->technology_stack,
				'gender'=>$request->gender,
				'marital_status'=>$request->marital_status,
				'father_name'=>$request->father_name,
				'address'=>$request->address,
				'pincode'=>$request->pincode,
				'state'=>$request->state,
				'district'=>$request->district,
				'countrycode'=>$request->country_code,
				'mobile'=>$request->mobile,
				'email'=>$request->email,
				'experience'=>$request->experience,
				'experience_years'=>$request->experience_years,
				'previous_employer'=>$request->previous_employer,
				'last_drawn_salary'=>$request->last_salary,
				'expected_salary'	=>$request->expected_salary,
				'why_changing_job'=>$request->why_changing_job,
				'why_getlead'=>$request->why_getlead,
				'qualification'=>$request->qualification,
				'job_category_id'=>$request->job_category_id,
				'cv_file'=>$fname2,
				'declaration'=>$request->declaration,
			];
						
			$apps=Application::create($data);
			
			if($apps)
			{   
				//Session::flash('success',"Application successfully submitted.");
				DB::commit();
				
				$cat=JobCategory::where('id',$request->job_category_id)->pluck('category_name')->first();
				$data['category_name']=$cat;
				
				$apiService=new ApiService();
				$api_result=$apiService->sendDataToCrm($data);
				
				\Log::info($api_result);
				return redirect('finish');
			}
			else
			{
				Session::flash('fail',"Something wrong, Try again.");
				DB::rollback();
				return redirect()->back()->withInput();
			}
			

	   }
		catch(\Exception $e)
		{
			\Log::info($e->getMessage());
			DB::rollback();
			Session::flash('fail',$e->getMessage());
			return redirect()->back()->withInput();
		}
		
    }

public function finish()
  {
	  return view('hr_form_finish');
  }



//testing function -------------------------------------------

public function store1(Request $request)
    {
		try{
			
			$path = 'Resume-Getlead';
			
			$photo="";
			$cv_file="";

			$nam=str_replace(' ','_',$request->first_name);
			
			if($request->file('photo'))
			{ 
				$image = $request->file('photo');
				$photo = $nam."_".rand(10, 100). date_timestamp_get(date_create()). '.' . $image->getClientOriginalExtension();
				$fname1=Storage::disk('spaces')->putFileAs("Resume-Getlead",$request->file('photo'),$photo, 'public');
			}
			
			if($request->file('cv_file'))
			{ 
				$imageMobile = $request->file('cv_file');
				$cvfile = $nam."_".rand(10, 100). date_timestamp_get(date_create()). '.' . $imageMobile->getClientOriginalExtension();
				$fname2=Storage::disk('spaces')->putFileAs("Resume-Getlead",$request->file('cv_file'),$cvfile,'public');
			}	
			
			}
		catch(\Exception $e)
		{
			\Log::info($e->getMessage());
			Session::flash('fail',$e->getMessage());
			return redirect()->back()->withInput();
		}
	  
    }




}
