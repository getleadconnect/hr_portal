<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

use App\Models\Application;

use Validator;
use DataTables;
use Session;
use Auth;
use Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
  public function __construct()
  {
     //$this->middleware('admin');
  }
  
  public function index()
  {
	  
	 $ap_count=Application::totalCount();
	 $week_count=Application::thisWeekCount();
	 $month_count=Application::thisMonthCount();
	 $year_count=Application::thisYearCount();
	 return view('admin.dashboard',compact('ap_count','week_count','month_count','year_count'));
  }	
  
 
}
