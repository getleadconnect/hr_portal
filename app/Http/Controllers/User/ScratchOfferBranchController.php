<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\ScratchBranch;
use App\Models\ScratchCustomer;
use App\Models\ScratchOffer;
use App\Models\ScratchWebCustomer;

use Auth;
use Validator;
use DataTables;
use Session;

class ScratchOfferBranchController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        
		return view('users.settings.scratch_branches');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $input = $request->all();
        $validator=validator::make($input, ScratchBranch::$rule, ScratchBranch::$message);
        if ($validator->passes()) {
            try
            {
              
              $userId=User::getVendorId();
              $offers=new ScratchBranch();
              $offers->branch=$request->branch;
              $offers->vendor_id=$userId;
              $offers->status="1";
              $flag=$offers->save();
			  
            if($flag)
            {
              return response()->json(['msg'=>"Branch Added Successfully", 'status' => true]);

            }
            else
            {
              return response()->json(['msg'=>"Something Went wrong", 'status' => false]);
            }
            }
            catch(\Exception $e)
            {
                return response()->json(['msg'=>$e->getMessage(), 'status' => false]);

            }

        } else {
             return response()->json(['msg'=>$validator->messages(), 'status' => false]);

           
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
	 
    public function show($id)
    {
        $offers=ScratchBranch::find($id);
        if($offers)
        {
              return response()->json(['msg' => "Offer detail found.", 'status' => 'success', 'data' => $offers]);
        }
        else {
            return response()->json(['msg' => "Offer detail not found.", 'status' => 'fail']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateBranch(Request $request)
    {
		$id=$request->branch_id;
        
		$validator=validator::make($request->all(),['branch_edit'=>'required'],['branch_edit'=>'Branch requeired']);
       
        if ($validator->fails())
		{
			 return response()->json(['msg'=>$validator->messages(), 'status' => false]);
		}
		else
		{
            
            try
            {
				
                $sbra=ScratchBranch::find($id);
                $sbra->branch=$request->branch_edit;
                $flag=$sbra->save();
                if($flag)
                {
                     return response()->json(['msg'=>'Branch updated.', 'status'=>true]);
                }
                else
                {
                     return response()->json(['msg'=>'Something went wrong, please try again later.', 'status'=>false]);
                }
                
            }
            catch(\Exception $e)
            {
                return response()->json(['msg'=>$e->getMessage(), 'status' => false]);
            }

        } 
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try 
        { 
            $flag = ScratchCustomer::where('branch_id',$id)->exists();
            $flag_new = ScratchWebCustomer::where('branch_id',$id)->exists();
            if($flag || $flag_new){
              return response(['msg' => "Offer Exists !! Then Branch Can't Delete .", 'status' => false]);
            }
            else{
              ScratchBranch::where('id', $id)->delete();
              return response(['msg' => 'Branch is deleted.', 'status' => true]);
            }
            
        }
        catch (\Exception $ex) {
            return response(['msg' => 'Something Went Wrong ddd', 'status' => false]);
        }
        return response(['msg' => 'Something Went Wrong', 'status' => false]);
  
          
      }
  

     public function viewBranches()
    {
      $id=User::getVendorId();

      $data = ScratchBranch::where('vendor_id',$id)->orderby('id','Desc')->get();
		
        return Datatables::of($data)
		->addIndexColumn()
        ->editColumn('name', function ($row) {
            if ($row->branch != null) {
                return $row->branch;
            } else {
                return "No Branch";
            }
        })
        
		->addColumn('status', function($row) {
			  
			if ($row->status==1) {
                $stat='<span class="badge rounded-pill bg-success">Active</span>';
            } else {
                $stat='<span class="badge rounded-pill bg-danger">Inactive</span>';
            }
			return $stat;
         })
		
         ->addColumn('action', function ($row) 
        {
			
			if ($row->status == 1) 
				{
					$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:;" id="'.$row->id.'" data-option="2" ><i class="lni lni-close"></i> Deactivate</a></li>';
				}
				else
				{
					$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:;" id="'.$row->id.'" data-option="1"><i class="lni lni-checkmark"></i> Activate</a></li>';
				}

				$action='<div class="fs-5 ms-auto dropdown">
							  <div class="dropdown-toggle dropdown-toggle-nocaret cursor-pointer" data-bs-toggle="dropdown"><i class="fadeIn animated bx bx-dots-vertical"></i></div>
								<ul class="dropdown-menu">
								<li><a class="dropdown-item edit-branch" href="javascript:;" id="'.$row->id.'" data-branch="'.$row->branch.'" data-bs-toggle="modal" data-bs-target="#edit-branch" ><i class="lni lni-pencil-alt"></i> Edit</a></li>
								<li><a class="dropdown-item delete-branch" href="javascript:;" id="'.$row->id.'"><i class="lni lni-trash"></i> Delete</a></li>
								  '.$btn.'<ul>
							</div>';
				return $action;				
			})
		
        ->rawColumns(['action','status'])
        ->toJson(true);
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

		$result=ScratchBranch::where('id',$id)->update($new);
		
			if($result)
			{
				if($op==1)
					return response()->json(['msg' =>'Branch successfully activated!' , 'status' => true]);
				else
				    return response()->json(['msg' =>'Branch successfully deactivated!' , 'status' => true]);
			}
			else
			{
				return response()->json(['msg' =>'Something wrong, try again!' , 'status' => false]);
			}				

	}

 

    
}
