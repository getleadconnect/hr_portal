<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Str;

use App\Models\Scratchads;
use App\Common\Variables;
use App\Facades\FileUpload;
use App\Models\User;

use DB;
use Auth;
use Validator;
use DataTables;

//use App\Http\Resources\Testimonial\TestimonialResource;

class ScratchAdImageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('users.ads_image.scratch_ads_image');
    }
	
    public function getScratchAds()
    {
      $vendorId=User::getVendorId();
      $ads = Scratchads::where('image','!=',NULL)->where('user_id',$vendorId)->orderby('id','Desc')->get();
        
        return Datatables::of($ads)
        ->addIndexColumn()
		->editColumn('image', function ($row) {
            if ($row->image !='') {
                return  '<a href="'.FileUpload::viewFile($row->image,'local').'" target="_blank" title="View Image"><img class="img-border" src='.FileUpload::viewFile($row->image,'local').' width="80"></a>';
            } else {
                return "--Nil--";
            }
        })
		 ->addColumn('status', function ($row) 
        {
            if ($row->status== Scratchads::ACTIVE) 
			{
                $stat='<span class="badge bg-success">Active</span>';
            }
            else
            {
                $stat= '<span class="badge bg-danger">Inactive</span>';
			}
            return $stat;
        })
        
        ->addColumn('action', function ($row) {
			
				if ($row->status == Scratchads::ACTIVE)
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
								  <li><a class="dropdown-item ads-delete" href="javascript:void(0)" id="'.$row->id.'"><i class="lni lni-trash"></i> Delete</a></li>'
								  .$btn.
								  '</ul>
							</div>';
							
				return $action;
        })
        ->rawColumns(['action','status','image'])
        ->toJson(true);
    }
		

    public function store(Request $request)
    {
      	$input = $request->all();
      	$userId=Auth::user()->pk_int_user_id;
        $validator=Validator::make($input, Scratchads::$ruleImage, Scratchads::$messageImage);
       // if validator passes
	   
        if ($validator->fails()) 
        {
			return response()->json(['msg'=>$validator->messages(), 'status' => false]);
		}
		else
		{
       		try
            {
            	
				if ($request->hasFile('image')) 
            	{
					
					$path = 'ads_images/';

            		$files = $request->file('image');
					
            		foreach($files as $file)
            		{
            			$ads = new Scratchads();
				        $fileName="";
                		$extension = $file->getClientOriginalExtension();
                		$fileName = Str::random(5)."-".date('his')."-".Str::random(3).".".$extension;
						
                        FileUpload::uploadFile($file, $path,$fileName,'local');
                		$ads->image = $path.$fileName;
                		$ads->created_by = $userId;
                		$ads->user_id = User::getVendorId();
                		$ads->status = Scratchads::ACTIVE;
                		$flag=$ads->save();
                	}
            	}
                if($flag)
                {
                     return response()->json(['msg'=>'Scratch Ads Image successfully uploaded.', 'status'=>true]);
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

    public function activateDeactivate($op,$id)
    {
      
	  if($op==1)
	  {
		  $dat=['status'=>Scratchads::ACTIVE];
	  }
	  else
	  {
		  $dat=['status'=>Scratchads::DEACTIVE];
	  }
	  
	  $userid=User::getVendorId();
      $result = Scratchads::where('id',$id)->update($dat);
      	if ($result)
		{	if($op==1)
			{
				return response()->json(['msg' => "Scratch Ads image activated.", 'status' => true]);
			} else {
				return response()->json(['msg' => "Scratch Ads image deactivated.", 'status' => true]);
			}
        } else {
          return response()->json(['msg' => "Ad not found.", 'status' => false]);
        }
      
    }


    public function destroy($id)
    {
       try 
       {
            $ads = Scratchads::find($id);
                if ($ads) {

					FileUpload::deleteFile($ads->image,'local');
                    $ads->delete();
                    return response(['msg' => 'Scratch Ads image has been deleted.', 'status' => true]);

                }
                else
                {
                    return response(['msg' => 'Something Went Wrong', 'status' => false]);
                }
            
        }
        catch (\Exception $ex) {
          return response(['msg' => 'Something Went Wrong', 'status' => false]);

            }

        
    }

}
