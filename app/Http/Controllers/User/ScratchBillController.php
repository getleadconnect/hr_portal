<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\ScratchBillNumber;
use App\Models\ScratchOffer;
use Validator;
use DataTables;
use Auth;
use Session;

class ScratchBillController extends Controller
{
       /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $id=User::getVendorId();
        $offers=ScratchOffer::where('fk_int_user_id',$id)->get();
       
        return view('users.settings.scratch_bills',compact('offers'));
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
        $validator=validator::make($input, ScratchBillNumber::$rule, ScratchBillNumber::$message);
        if ($validator->fails())
		{
			return response()->json(['msg'=>$validator->messages(), 'status' => false]);
		}
		else
		{
            try
            {
              
				  $userId=User::getVendorId();
				  $bill=new ScratchBillNumber();
				  $bill->bill_number=$request->bill_number;
				  $bill->offer_id=$request->offer_id;
				  $bill->vendor_id=$userId;
				  $flag=$bill->save();
				  
				if($flag)
				{
				  return response()->json(['msg'=>"Bill Number Added Successfully", 'status' => true]);

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
        $bills=ScratchBillNumber::find($id);
        $id=User::getVendorId();
        $offers=ScratchOffer::where('fk_int_user_id',$id)->get();
        if($bills)
        {
              return response()->json(['msg' => "Bills detail found.", 'status' => 'success', 'data' => $bills,'offers'=>$offers]);
        }
        else {
            return response()->json(['msg' => "Bill detail not found.", 'status' => 'fail']);
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
        $vid=User::getVendorId();
		
        $offers=ScratchOffer::where('fk_int_user_id',$vid)->get();
		$bill=ScratchBillNumber::where('id',$id)->first();
        return view('users.settings.edit_bill',compact('offers','bill'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateBill(Request $request)
    {
        $vendorid=User::getVendorId();
        $id=$request->bill_id;
		
        $validator=validator::make($request->all(), ScratchBillNumber::$editRule, ScratchBillNumber::$editMessage);
       
        if ($validator->fails()) {
			 return back()->withErrors(['msg'=>$validator->editMessages(), 'status' => false]);
		}
		else
		{
            try
            {
                $bill=ScratchBillNumber::where('id',$id)->first();
                $bill->bill_number=$request->bill_number_edit;
                $bill->offer_id=$request->offer_id_edit;
                $flag=$bill->save();
                if($flag)
                {
					Session::flash('success','Bill Number updated.');
                     return back();
                }
                else
                {
                     Session::flash('fail','Something went wrong, please try again later.');
					  return back();
                }
                
            }
            catch(\Exception $e)
            {
                Session::flash('fail',$e->getMessage());
				return back();
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
            $vendorid=User::getVendorId();
            $flag =ScratchBillNumber::where('id',$id)->delete();
            if($flag){
              return response(['msg' => "Bill successfully deleted!", 'status' => true]);
            }
            else{
              return response(['msg' => 'Something wrong, Try again.', 'status' => false]);
            }
            
        }
        catch (\Exception $ex) {
            return response(['msg' =>$ex->getMessage(), 'status' => false]);
        }
  
      }
    
  
      public function viewBills()
      {
        $id=User::getVendorId();
  
        $bills = ScratchBillNumber::select('scratch_bill_numbers.*','tbl_scratch_offers.vchr_scratch_offers_name')
		->leftJoin('tbl_scratch_offers','scratch_bill_numbers.offer_id','=','tbl_scratch_offers.pk_int_scratch_offers_id')
		->where('scratch_bill_numbers.vendor_id',$id)->orderby('id','Desc')->get();
 				  
          return Datatables::of($bills)
		  ->addIndexColumn()
          ->editColumn('bill', function($bills) {
              if ($bills->bill_number != null) {
                  return $bills->bill_number;
              } else {
                  return "No Bill Number";
              }
          })
		  ->editColumn('offer_name', function($bills) {
			  $offer_name=$bills->vchr_scratch_offers_name;
              if ($bills->vchr_scratch_offers_name==null) 
			  {
                 $offer_name="--Nil--";
              }
			  return $offer_name;
          })
		  
		  ->addColumn('status', function($bills) {
			  
			if ($bills->status==1) {
                $stat='<span class="badge rounded-pill bg-success">Active</span>';
            } else {
                $stat='<span class="badge rounded-pill bg-danger">Inactive</span>';
            }
			return $stat;
          })
		  
          ->addColumn('action', function ($bills) 
          {
			
			if ($bills->status == 1) 
				{
					$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:;" id="'.$bills->id.'" data-option="2" ><i class="lni lni-close"></i> Deactivate</a></li>';
				}
				else
				{
					$btn='<li><a class="dropdown-item btn-act-deact" href="javascript:;" id="'.$bills->id.'" data-option="1"><i class="lni lni-checkmark"></i> Activate</a></li>';
				}

				$action='<div class="fs-5 ms-auto dropdown">
							  <div class="dropdown-toggle dropdown-toggle-nocaret cursor-pointer" data-bs-toggle="dropdown"><i class="fadeIn animated bx bx-dots-vertical"></i></div>
								<ul class="dropdown-menu">
								<li><a class="dropdown-item bill-edit" href="javascript:;" id="'.$bills->id.'" data-bs-toggle="offcanvas" data-bs-target="#edit-scratch-bill" aria-controls="offcanvasScrolling" ><i class="lni lni-pencil-alt"></i> Edit</a></li>
								<li><a class="dropdown-item bill-delete" href="javascript:;" id="'.$bills->id.'"><i class="lni lni-trash"></i> Delete</a></li>
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

		$result=ScratchBillNumber::where('id',$id)->update($new);
		
			if($result)
			{
				if($op==1)
					return response()->json(['msg' =>'Bill successfully activated!' , 'status' => true]);
				else
				    return response()->json(['msg' =>'Bill successfully deactivated!' , 'status' => true]);
			}
			else
			{
				return response()->json(['msg' =>'Something wrong, try again!' , 'status' => false]);
			}				

	}

 
   
}
