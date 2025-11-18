<style>
#app-dt tr
{
	height:30px;
}
</style>
<div class="row">
<div class="col-12 col-lg-12 col-xl-12 col-xxl-12">

<table id="app-dt" style="width:98%;">

<tr><td colspan=2><h6>Personal Information</h6></td></tr>

<tr><td colspan=2><img src="{{$apdt->photo_file_path}}" style="width:80px;"></td></tr>
<tr><td colspan=2><h6>{{strtoupper($apdt->name)}}</h6></td></tr>
<tr><td>Mobile</td><td>:&nbsp;{{$apdt->country_code.$apdt->mobile}}</td></tr>
<tr><td>Email</td><td>:&nbsp;{{$apdt->email}}</td></tr>
<tr><td>Date of Birth</td><td>:&nbsp;{{$apdt->dob}}</td></tr>
<tr><td>Gender</td><td>:&nbsp;{{$apdt->gender}}</td></tr>
<tr><td>Marital Status</td><td>:&nbsp;{{$apdt->marital_status}}</td></tr>

<tr><td colspan=2 class="pt-2 pb-2"><h6>Additional Information</h6></td></tr>

<tr><td>Father Name</td><td>:&nbsp;{{$apdt->father_name}}</td></tr>
<tr><td>Address</td><td>:&nbsp;{{$apdt->address}}</td></tr>
<tr><td>Pincode</td><td>:&nbsp;{{$apdt->pincode}}</td></tr>
<tr><td>State</td><td>:&nbsp;{{$apdt->state}}</td></tr>
<tr><td>District</td><td>:&nbsp;{{$apdt->district}}</td></tr>

<tr><td colspan=2 style="height:35px;"><h6>Professional Information</h6></td></tr>

<tr><td>Qualification</td><td>:&nbsp;{{$apdt->qualification}}</td></tr>
<tr><td>Technology Stack</td><td>:&nbsp;{{$apdt->technology_stack}}</td></tr>
<tr><td>Experience</td><td>:&nbsp;{{$apdt->experience}}</td></tr>
<tr><td>Experience Years</td><td>:&nbsp;{{$apdt->experience_years}}</td></tr>
<tr><td>Previous Employer</td><td>:&nbsp;{{$apdt->previous_employer}}</td></tr>
<tr><td>Last Drawn Salary</td><td>:&nbsp;{{$apdt->last_drawn_salary}}</td></tr>
<tr><td>Expected Salary</td><td>:&nbsp;{{$apdt->expected_salary}}</td></tr>

<tr><td colspan=2 style="height:35px;"><h6>General Information</h6></td></tr>

<tr><td>Why Changing Job</td><td>:&nbsp;{{$apdt->why_changing_jog}}</td></tr>
<tr><td>Why Getlead</td><td>:&nbsp;{{$apdt->why_getlead}}</td></tr>
<tr><td>Application For</td><td>:&nbsp;{{$apdt->category_name}}</td></tr>
<tr><td>CV File</td><td>:&nbsp;<a href="{{$apdt->cv_file_path}}" target="_blank"><button class="btn btn-primary fs-7" style="padding:2px 10px;">View CV</button></a></td></tr>
<tr><td>Declaration</td><td>:&nbsp;{{$apdt->declaration}}</td></tr>

</table>

</div>
</div>

