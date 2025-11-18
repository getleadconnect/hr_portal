<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\ScratchCount;

use Validator;
use DataTables;
use Session;
use Auth;
use Log;

class DashboardController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	
	$user_id=User::getVendorId();
	
	$tot_count=ScratchCount::getTotalScratchCount($user_id);
	$used_count=ScratchCount::getUsedScratchCount($user_id);
	$bal_count=ScratchCount::getBalanceScratchCount($user_id);
			
	return view('users.dashboard',compact('tot_count','used_count','bal_count'));
  }	
  
 
}
