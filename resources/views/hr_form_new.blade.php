<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Getlead HR Form">
    <meta name="author" content="Getlead">
    <title>Getlead | HR Form</title>

    <!-- Favicons-->
    <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">

    <!-- Google Web Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Core CSS -->
    <link href="{{url('form_assets/css/bootstrap.min.css')}}" rel="stylesheet">
    <link href="{{url('form_assets/css/style_workshop.css')}}" rel="stylesheet">
    <link href="{{url('form_assets/css/custom.css')}}" rel="stylesheet">

	<link href="{{url('assets/intl-tel-input17.0.3/intlTelInput.min.css')}}" rel="stylesheet"/>
	<link href="{{url('assets/plugins/toastr/css/toastr.min.css')}}" rel="stylesheet" />

	<style>

	.btn-radio
	{
		width:20px;
		height:20px;
		vertical-align:middle;
		margin-left:15px;
	}
	</style>

</head>

<body>
	
	<div id="preloader">
		<div data-loader="circle-side"></div>
	</div><!-- /Preload -->
	
	<div id="loader_form">
		<div data-loader="circle-side-2"></div>
	</div><!-- /loader_form -->

	<div class="container-fluid">
	    <div class="row row-height">
	        <div class="col-lg-5 background-image p-0" style="background-color: #235287;" data-background="url('form_assets/img/main_img_4.jpg')">
	            <div class="content-left-wrapper opacity-mask d-flex align-items-center justify-content-center text-left" data-opacity-mask="rgba(0, 0, 0, 0.4)">
	                <a href="#0" id="logo"><img src="{{asset('form_assets/img/getlead_logo.svg')}}" alt="" width="250" ></a>
	                <!-- <div class="social">
	                    <ul>
	                        <li><a href="#0"><i class="bi bi-facebook"></i></a></li>
	                        <li><a href="#0"><i class="bi bi-twitter"></i></a></li>
	                        <li><a href="#0"><i class="bi bi-instagram"></i></a></li>
	                    </ul>
	                </div> -->
	                <!-- /social -->
	                <div>
					
					<h1><em>Getlead HR Form</em></h1>
                        <p style="font-size: 12px;">Submit your details to apply for your desired position. Our HR team will review your application and get in touch with you soon.</p>
                    </div>
	                
	                <a class="smoothscroll btn_scroll_to Bounce infinite" href="#wizard_container"><i class="bi bi-arrow-down-short"></i></a>
	            </div>
	        </div>
			
			<div class="col-lg-7 d-flex flex-column content-right">
	            <div class="container my-auto py-5">
	                <div class="row">
	                    <div class="col-lg-9 col-xl-7 mx-auto">
	                        <div id="wizard_container">
	                            <div id="top-wizard">
	                                <span id="location"></span>
	                                <div id="progressbar"></div>
	                            </div>
	                            <!-- /top-wizard -->
	                            <form id="wrapped" method="POST" action="{{url('save-application')}}" enctype="multipart/form-data">
								@csrf
								
	                                <div id="middle-wizard">
									
	                                    <div class="step">
											
	                                    <h3 class="main_question">Register now!</h3>
										
											<!--<div class="mb-3  ">
												<label for="firstname">First name</label>
	                                            <input type="text" name="firstname" id="firstname" class="form-control" placeholder="First name">
	                                        </div> -->
									
	                                        <div class="mb-3 ">
												<label for="first_name">First name</label>
	                                            <input type="text" name="first_name" id="first_name" class="form-control required" placeholder="Name" required>
	                                        </div>
																						
											<div class="mb-3">
	                                            <label for="mobile">Mobile</label>
												
												<div class="input-group mb-3">
												  <div class="input-group-prepend">
													<span class="input-group-text" id="basic-addon1">+91</span>
												  </div>
												  <input type="hidden" name="country_code" id="country_code" value="91">
												  <input type="number" name="mobile" id="mobile" class="form-control required"  minlength=10 maxlength=10 placeholder="Mobile" aria-label="mobile" aria-describedby="basic-addon1" required>
												</div>
												
	                                        </div>
											
											<div class="mb-3">
												<label for="email">Email</label>
	                                            <input type="email" name="email" id="email" class="form-control required"  placeholder="Email" required>
	                                            
	                                        </div>
											
											@php
												$sdt=Date('Y')-18;
												$edt=Date('Y')-60;
												$month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
											@endphp
	
											<div class="mb-3 ">
												<label for="dob">Date of Birth</label>
												
												<div class="row">
												<div class="col-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
												<select class="form-select" name="year" id="year"  class="required" placeholder="Year" required >
													<option value="" >YYYY</option>
													@for($x=$sdt;$x>=$edt;$x--)
													<option value="{{$x}}">{{$x}}</option>	
													@endfor
												</select>
												</div>
												<div class="col-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
												
												<select class="form-select" name="month" id="month"  class="required" placeholder="month" required >
													<option value="" >MM</option>
													@foreach($month as $key=>$mon)
													<option value="{{++$key}}">{{$mon}}</option>	
													@endforeach
												</select>
												</div>
												<div class="col-12 col-md-3 col-lg-3 col-xl-3 col-xxl-3">
												<select class="form-select" name="day" id="day"  class="required" placeholder="day" required >
													<option value="" >DD</option>
													@for($x=1;$x<=31;$x++)
													<option value="{{$x}}">{{$x}}</option>	
													@endfor
												</select>
												</div></div>
	                                        </div>
																						
											<div class="mb-3 ">
											<label for="gender">Gender</label>
	                                            <select class="form-select" name="gender" id="gender"  class="required" placeholder="Gender" required>
													<option value="" >--select--</option>
													<option value="Male">Male</option>
													<option value="Female">Female</option>
												  </select>
	                                            
	                                        </div>

											<div class="mb-3">
												<label for="marital_status">Marital Status</label><br>
												<select class="form-select" name="marital_status" id="marital_status" class="required" placeholder="Marital Status" required>
													<option value="">--select--</option>
													<option value="Single">Single</option>
													<option value="Married">Married</option>
													<option value="Divorced">Divorced</option>
												  </select>
	                                        </div>
	                                        
											<div class="mb-3 ">
												<label for="technology_stack">Skills</label><br>
												<input type="text" name="technology_stack" id="technology_stack" class="form-control " placeholder="Eg: Laravel, React JS, UI/UX Designaer" >
	                                        </div>
											

											<div class="mb-3  ">
												<label for="job_category_name">Applied for</label>
	                                            <select name="job_category_id" id="job_category_id" class="form-select required" placeholder="Category Name" required>
													<option value="" >--Select--</option>
													@foreach($job_cat as $row)
														<option value="{{$row->id}}">{{$row->category_name}}</option>
													@endforeach
												</select>
												
	                                        </div>


										</div>
										
										 <div class="step">
						
											<h3 class="main_question">Additional Information!</h3>
											
											<div class="mb-3">
												<label for="father_name">Father Name</label>
	                                            <input type="text" name="father_name" id="father_name" class="form-control required" placeholder="Father Name" required>
	                                            
	                                        </div>

											<div class="mb-3 ">
												<label for="address">Address</label>
	                                            <input type="text" name="address" id="address" class="form-control required"  placeholder="Address" required>
	                                            
	                                        </div>
											
											<div class="mb-3  ">
												<label for="pincode">Pin Code</label>
	                                            <input type="number" name="pincode" id="pincode" class="form-control required" maxlength="6" minlength="6" placeholder="Pin Code" required>
	                                            
	                                        </div>
											
											<div class="mb-3  ">
												<label for="state">State</label>
	                                            <input type="text" name="state" id="state" class="form-control required" placeholder="State" required>
	                                            
	                                        </div>
											
											<div class="mb-3  ">
												<label for="district">District</label>
	                                            <input type="text" name="district" id="district" class="form-control required" placeholder="District" required>
	                                        </div>
											
											</div>
											
											<div class="step">
											
											<h3 class="main_question">Professional Information!</h3>
	
											<div class="mb-3  ">
												<label for="qualification">Qualification</label>
	                                            <input type="text" name="qualification" id="qualification" class="form-control required" placeholder="Qualification" required>
	                                        </div>
											
											<div class="mb-3  ">
												<label for="experience">Are You Experinced?</label>
	                                            <select name="experience" id="experience" class="form-select required" placeholder="Experience" required>
                                                <option value="">--Select--</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
											</div>
											
											<div class="mb-3  ">
												<label for="years_experience">If Yes, How Many Years?</label>
												<input type="number" name="years_experience" id="years_experience" class="form-control required" placeholder="Years" required>
	                                        </div>
											
											<div class="mb-3  ">
												<label for="previous_employer">Previous Employer</label>
												<input type="text" name="previous_employer" id="previous_employer" class="form-control required" placeholder="Employer" required>

	                                        </div>
	     	
											<div class="mb-3  ">
												<label for="last_salary">Last Drawn Salary</label>
	                                            <input type="number" name="last_salary" id="last_salary" class="form-control required" placeholder="Last Salary"  required>
	                                            
	                                        </div>
									
											<div class="mb-3  ">
												<label for="expected_salary">Expected Salary</label>
	                                            <input type="number" name="expected_salary" id="expected_salary" class="form-control required"  placeholder="Expected Salary" required>
	                                            
	                                        </div>
											
											<div class="mb-3  ">
												<label for="changing_job">Why changing Job?</label>
	                                            <input type="text" name="changing_jog" id="changing_job" class="form-control required" placeholder="Details"  required>
	                                            
	                                        </div>
											
											<div class="mb-3  ">
												<label for="why_getlead">Why Getlead?</label>
	                                            <input type="text" name="why_getlead" id="why_getlead" class="form-control required" placeholder="Why getlead" required>

											</div>
																						
										</div>	
										
											<!-- Step 4: Upload Documents -->
                                    <div class="submit step">
									
										<h3 class="main_question">Upload Documents</h3>
                                        <div class="mb-3">
                                            <label for="photo">Upload Your Photo</label>
                                            <input type="file" name="photo" id="photo" class="form-control required" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="cv_file">Upload Your CV</label>
                                            <input type="file" name="cv_file" id="cv_file" class="form-control required" required>
                                        </div>
										
										<div class="mb-3  ">
											<label><b>Declaration</b></label>
	                                        <p class="mt-2">I heare by declare that all the statments made in the application are true and complete to the best of my knowledge and belive.</p>
	                                    </div>
											
                                    </div>
											
								</div> 
	                                <!-- /middle-wizard -->
	                                <div id="bottom-wizard">
	                                    <button type="button" name="backward" class="backward" >Prev</button>
	                                    <button type="button" name="forward" class="forward" >Next</button>
	                                    <button type="submit" name="process" class="submit" >Submit</button>
	                                </div>
	                                <!-- /bottom-wizard -->
	                            </form>
	                        </div>
	                        <!-- /Wizard container -->
	                    </div>
	                </div>
	            </div>
	            <div class="container pb-4 copy">
				    <span class="float-start"><a href="https://getleadcrm.com/" target="new">© Getlead</a> </span>
				    <!--<a class="btn_help float-end" href="#modal-help" id="modal_h"><i class="bi bi-question-circle"></i> Help</a><br>-->
				</div>
	        </div>
	    </div>
	    <!-- /row -->
	</div>
	<!-- /container -->
	
	<!-- Modal terms -->
	<div class="modal fade" id="terms-txt" tabindex="-1" role="dialog" aria-labelledby="termsLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title" id="termsLabel">Privacy data terms</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					
				</div>
				<div class="modal-footer">
					<button type="button" class="btn_1" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->

	<!-- COMMON SCRIPTS -->
	<script src="{{url('form_assets/js/jquery-3.7.1.min.js')}}"></script>
    <script src="{{url('form_assets/js/common_scripts.js')}}"></script>
	<script src="{{url('form_assets/js/velocity.min.js')}}"></script>
	<script src="{{url('form_assets/js/functions.js')}}"></script>
	<script src="{{url('assets/plugins/toastr/js/toastr.min.js')}}"></script>
	
@if(Session::get('success'))
	<script>
		toastr.success("{{Session::get('success')}}");
	</script>
@endif

@if (Session::get('fail'))
	<script>
		toastr.error("{{Session::get('fail')}}");
	</script>
@endif
	
<script type="text/javascript">


	
photo.onchange = evt => {
  const [file] = photo.files

        var allowedExtensions="";
	    allowedExtensions = /(\.jpg|\.jpeg|\.jpe|\.png)$/i; 
	    var filePath = file.name;
		console.log(file);
	
		if (!allowedExtensions.exec(filePath)) { 
			alert('Invalid file type, to select (jpg,jpeg,jpe,png) only.'); 
			$("#photo").val('');
		}
		
}

cv_file.onchange = evt => {
  const [file] = cv_file.files

        var allowedExtensions="";
	    allowedExtensions = /(\.pdf|\.doc|\.docx)$/i; 
	    var filePath = file.name;
		console.log(file);
	
		if (!allowedExtensions.exec(filePath)) { 
			alert('Invalid file type, To select (pdf,doc,docx) files only.'); 
			$("#cv_file").val('');
		}

}
		
</script>

</body>
</html>