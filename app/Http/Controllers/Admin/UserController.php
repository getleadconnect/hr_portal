<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Facades\FileUpload;

use App\Models\User;

use Validator;

use DataTables;
use Session;
use Auth;
use Log;
use DB;

class UserController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	 return view('admin.users.users_list');
  }	

    
  public function store(Request $request)
    {
        // return $request;

        $validator=validator::make($request->all(),User::$userRule,User::$userRuleMessage);
		
        if ($validator->fails()) 
		{
			return response()->json(['msg'=>$validator->messages()->first(),'status'=>false]);
		}
		else
		{
            try
			{
   
				$data=[
					'user_name'=>$request->user_name,
					'email'=>$request->email,
					'countrycode'=>$request->country_code,
					'mobile'=>$request->mobile,
					'user_mobile'=>$request->country_code.$request->mobile,
					'password'=>Hash::make($request->password),
					'status'=>User::ACTIVATE,
					'role_id'=>User::USERS
				];
					
				$result=User::create($data);

				if($result)
        		{   
					return response()->json(['msg'=>'User successfully added.','status'=>true]);
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
    	
	
 public function viewUsers()
    {

      $users = User::where('role_id','!=',1)->orderby('id','Desc')->get();
	
        return Datatables::of($users)
		->addIndexColumn()
		->addColumn('name', function ($row) {
			return $row->user_name;
        })
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
                              <li><a class="dropdown-item edit-user" href="javascript:void(0)" id="'.$row->id.'" data-bs-toggle="offcanvas" data-bs-target="#edit-user"  ><i class="lni lni-pencil-alt"></i> Edit</a></li>
                              <li><a class="dropdown-item delete-user" href="javascript:void(0)" id="'.$row->id.'"><i class="lni lni-trash"></i> Delete</a></li>'
							  .$btn.
							  '</ul>
                        </div>';
			return $action;
        })
        ->rawColumns(['action','name','status'])
        ->make(true);
    }


public function edit($id)
{
	$usr=User::where('id',$id)->first();
	return view('admin.users.edit_user',compact('usr'));
}


  public function updateUser(Request $request)
    {

        $validator=validator::make($request->all(), User::$userUpdate, User::$updateMessage);
        if ($validator->fails()) 
		{
			return response()->json(['msg'=>$validator->messages()->first(),'status'=>false]);
		}
		else
		{
			try{

				$user_id=$request->user_id;
            	
				$data=[
					'user_name'=>$request->user_name_edit,
					'email'=>$request->email_edit,
					'countrycode'=>$request->country_code_edit,
					'mobile'=>trim($request->mobile_edit),
					'user_mobile'=>$request->country_code_edit.trim($request->mobile_edit),
				];
						
				$result=User::where('id',$user_id)->update($data); 

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


public function destroy($id)
{
	
	try
	{
		$users=User::where('id',$id)->first();
		
		if($users)
		{
			$res=$users->delete();
			if($res)
			{   
				return response()->json(['msg'=>'User successfully removed.','status'=>true]);
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

		$result=User::where('id',$id)->update($new);
		
			if($result)
			{
				if($op==1)
					return response()->json(['msg' =>'User successfully activated!' , 'status' => true]);
				else
				    return response()->json(['msg' =>'User successfully deactivated!' , 'status' => true]);
			}
			else
			{
				return response()->json(['msg' =>'Something wrong, try again!' , 'status' => false]);
			}				

	}


}
