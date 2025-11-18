<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\JobCategory;

use Validator;

use DataTables;
use Session;
use Auth;
use Log;
use DB;

class JobCategoryController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	 return view('admin.job_category_list');
  }	

    
  public function store(Request $request)
    {
        // return $request;

        $validator=validator::make($request->all(),JobCategory::$jcRule,JobCategory::$jcMessage);
		
        if ($validator->fails()) 
		{
			return response()->json(['msg'=>$validator->messages()->first(),'status'=>false]);
		}
		else
		{
            try
			{
   
				$data=[
					'category_name'=>$request->category_name,
					'status'=>1,
				];
					
				$result=JobCategory::create($data);

				if($result)
        		{   
					return response()->json(['msg'=>'Category successfully added.','status'=>true]);
        		}
        		else
        		{
					return response()->json(['msg'=>'Something wrong, Try again.','status'=>false]);
        		}

           }
            catch(\Exception $e)
            {
			   return response()->json(['msg'=>$e->getMessage(),'status'=>false]);
            }
        } 
    }
    	
	
 public function viewJobCategories()
    {

      $jcats = JobCategory::where('status',1)->orderby('id','Desc')->get();
	
        return Datatables::of($jcats)
		->addIndexColumn()
		->addColumn('status', function ($row) {
            if ($row->status==1) {
                $status='<span class="badge rounded-pill bg-success">Active</span>';
            } else {
                $status='<span class="badge rounded-pill bg-danger">Inactive</span>';
            }
			return $status;
        })
				
        ->addColumn('action', function ($row)
        {
			if ($row->status==1)
			{
				$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:void(0)" id="'.$row->id.'" data-option="2" ><i class="lni lni-close"></i> Deactivate</a></li>';
			}
			else
			{
				$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:void(0)" id="'.$row->id.'" data-option="1"><i class="lni lni-checkmark"></i> Activate</a></li>';
			}

			$action='<div class="fs-5 ms-auto dropdown">
                    <div class="dropdown-toggle dropdown-toggle-nocaret cursor-pointer" data-bs-toggle="dropdown"><i class="fadeIn animated bx bx-dots-vertical"></i></div>
                        <ul class="dropdown-menu">
                        <li><a class="dropdown-item edit-cat" href="javascript:void(0)" id="'.$row->id.'" data-cat="'.$row->category_name.'" data-bs-toggle="modal" data-bs-target="#edit-category"><i class="lni lni-pencil-alt"></i> Edit</a></li>
                       <li><a class="dropdown-item delete-cat" href="javascript:void(0)" id="'.$row->id.'"><i class="lni lni-trash"></i> Delete</a></li>'
						.$btn.
					  '</ul>
                    </div>';
			return $action;
        })
        ->rawColumns(['action','name','status'])
        ->make(true);
    }

  public function updateJobCategory(Request $request)
    {
			try{

				$cat_id=$request->cat_id;
            	
				$data=[
					'category_name'=>$request->category_name_edit,
				];
						
				$result=JobCategory::where('id',$cat_id)->update($data); 

				if($result)
        		{   
					Session::flash('success','Category successfully updated.');
        		}
        		else
        		{
					Session::flash('fail','Something wrong, try again.');
        		}
	
				
            }
            catch(\Exception $e)
            {
                Session::flash('fail',$e->getMessage());
            }
			
			return redirect()->back();;
        } 

public function destroy($id)
{
	
	try
	{
		$jcats=JobCategory::where('id',$id)->first();
		
		if($jcats)
		{
			$res=$jcats->delete();
			if($res)
			{   
				return response()->json(['msg'=>'Category successfully removed.','status'=>true]);
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


public function activateDeactivate($op,$id)
	{
		if($op==1)
		{
		   $new=['status'=>1];
		}
		else
		{	
		   $new=['status'=>0];
		}

		$result=JobCategory::where('id',$id)->update($new);
		
			if($result)
			{
				if($op==1)
					return response()->json(['msg' =>'Category successfully activated!' , 'status' => true]);
				else
				    return response()->json(['msg' =>'Category successfully deactivated!' , 'status' => true]);
			}
			else
			{
				return response()->json(['msg' =>'Something wrong, try again!' , 'status' => false]);
			}				

	}


}
