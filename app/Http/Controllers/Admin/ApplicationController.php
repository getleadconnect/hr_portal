<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\Application;

use Validator;

use DataTables;
use Session;
use Auth;
use Log;
use DB;

class ApplicationController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	 return view('admin.application.applications_list');
  }	


 public function viewApplications()
    {

      $apps = Application::select('applications.*','job_category.category_name')
		->leftJoin('job_category','applications.job_category_id','=','job_category.id')
		->orderby('id','Desc')->get();
	
        return Datatables::of($apps)
		->addIndexColumn()
		->addColumn('name', function ($row) {
			if ($row->name != null) {
                return ucwords($row->name);
            } else {
                return "--Nil--";
            }
        })
		->addColumn('job_cat', function ($row) 
		{
			return $row->category_name;
        })
		
		->addColumn('dated', function ($row) 
		{
			return date_create($row->created_at)->format('d-m-Y');
        })
		->addColumn('mobile', function ($row) {
			return $row->country_code.$row->mobile;
        })
		
		->addColumn('photo', function ($row) 
		{
			
			if ($row->photo !='') {
				
				if($row->id<=93)
				{
					return  '<img src='.FileUpload::viewFile($row->photo,'local').' width="50" height="50">';
				}
				else
				{
					return  '<img src='.config('constants.file_path').$row->photo.' width="50" height="50">';
				}
            } else {
                return "--Nil--";
            }
        })
		->addColumn('cv_file', function ($row) 
		{
			if ($row->cv_file !='') {
				if($row->id<=93)
				{
					return  '<a href="'.FileUpload::viewFile($row->cv_file,'local').'" target="_blank">View CV</a>';
				}
				else
				{
					return  '<a href="'.config('constants.file_path').$row->cv_file.'" target="_blank">View CV</a>';  //space account
				}
				
            } else {
                return "--Nil--";
            }
        })
		->addColumn('salary', function ($row) 
		{
			return  "Last: ".$row->last_drawn_salary."<br>Expected: ".$row->expected_salary;
        })
		
        ->addColumn('action', function ($row)
        {
			$action='<div class="fs-5 ms-auto dropdown">
                          <div class="dropdown-toggle dropdown-toggle-nocaret cursor-pointer" data-bs-toggle="dropdown"><i class="fadeIn animated bx bx-dots-vertical"></i></div>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item delete-app" href="javascript:void(0)" id="'.$row->id.'"><i class="lni lni-trash"></i> Delete</a></li>
							   <li><a class="dropdown-item view-dt" href="javascript:void(0)" id="'.$row->id.'" data-bs-toggle="offcanvas" data-bs-target="#application_details" ><i class="lni lni-eye"></i> View</a></li>
							  </ul>
                        </div>';
			return $action;
        })
        ->rawColumns(['action','photo','salary','cv_file','name'])
        ->make(true);
    }


public function destroy($id)
{
	
	try
	{
		$app=Application::where('id',$id)->first();
		
		if($app)
		{
			/*if($app->photo!='')
				Storage::disk('spaces')->delete($app->photo);
			if($app->cv_file!='')
				Storage::disk('spaces')->delete($app->cv_file);
			*/
			
			$res=$app->delete();
			if($res)
			{   
				return response()->json(['msg'=>'Application successfully removed.','status'=>true]);
			}
			else
			{
				return response()->json(['msg'=>'Something wrong, Try again.','status'=>false]);
			}
		}
	}
	catch(\Exception $e)
	{
		return response()->json(['msg'=>$e->getMessage(),'status'=>false]);
	}
}

public function viewApplicationDetails($id)
{
	$apdt=Application::select('applications.*','job_category.category_name')
	->leftJoin('job_category','applications.job_category_id','=','job_category.id')
	->where('applications.id',$id)->get()->map(function($q)
	{
		if($q->id<=93)
		{
			if($q->photo!="")
				$q->photo_file_path=FileUpload::viewFile($q->photo,'local');
			if($q->cv_file!="")
				$q->cv_file_path=FileUpload::viewFile($q->cv_file,'local');
		}
		else
		{
			if($q->photo!="")
				$q->photo_file_path=config('constants.file_path').$q->photo;
			if($q->cv_file!="")
				$q->cv_file_path=config('constants.file_path').$q->cv_file;
		}
		
		return $q;
		
	})->first();
	return view('admin.application.application_details',compact('apdt'));
}


}
