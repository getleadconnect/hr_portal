@extends('layouts.master')
@section('title','Staff Details')
@section('contents')
<style>
.card-body{
	padding-top:2px !important;
}
.form-section-title {
    background: #f8f9fa;
    padding: 10px 15px;
    margin: 15px 0 10px 0;
    border-left: 4px solid #0d6efd;
    font-weight: 600;
    font-size: 14px;
}
</style>

<link href="{{ asset('assets/intl-tel-input17.0.3/intlTelInput.min.css')}}" rel="stylesheet"/>

<!-- for message -------------->
		<input type="hidden" id="view_message" value="{{ Session::get('message') }}">
<!-- for message end-------------->


<div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
    <div class="breadcrumb-title pe-3">Staff Details</div>
</div>
<!--end breadcrumb-->

<div class="card">
    <div class="card-header p-y-3">
        <div class="row">
            <div class="col-lg-9 col-xl-9 col-xxl-9 col-9">
                <h6 class="mb-0 pt5">Employees List</h6>
            </div>
            <div class="col-lg-3 col-xl-3 col-xxl-3 col-3 text-end">
                <a href="#" class="btn btn-primary btn-sm" data-bs-toggle="offcanvas" data-bs-target="#add-employee">
                    <i class="fa fa-plus"></i>&nbsp;Add Employee
                </a>
            </div>
        </div>
    </div>
    <div class="card-body">
        <div class="row mt-3">
            <div class="col-12">
                <div class="table-responsive">
                    <table id="datatable" class="table align-middle" style="width:100% !important;">
                        <thead class="table-semi-dark">
                            <tr>
                                <th>SlNo</th>
                                <th>Photo</th>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Job Title</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th class="no-content" style="width:50px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add Employee Offcanvas -->
<div class="offcanvas offcanvas-end shadow border-start-0 p-2" id="add-employee" style="width:30% !important;height:900px; overflow-y:auto;" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1">
    <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title">Add New Employee</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
        <form id="formAddEmployee" enctype="multipart/form-data">
            @csrf

            <!-- A. Personal Information -->
            <div class="form-section-title">A. Personal Information</div>

            <div class="row mb-2">
                <div class="col-9">
                    <label class="form-label">Profile Image</label>
                    <input type="file" class="form-control" name="profile_image" id="profile_image" accept="image/*" onchange="previewProfileImage(event)">
                </div>

                <div class="col-3">
                    <div id="profile_image_preview" class="mt-2" style="display:none;">
                        <img id="preview_img" src="" alt="Profile Preview" style="max-width: 80px; max-height: 150px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                    </div>
                </div>
                
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Full Name<span class="required">*</span></label>
                    <input type="text" class="form-control" name="full_name" id="full_name" required>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-6">
                    <label class="form-label">Employee ID<span class="required">*</span></label>
                    <input type="text" class="form-control" name="employee_id" id="employee_id" required>
                </div>
                <div class="col-6">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control" name="date_of_birth" id="date_of_birth">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-6">
                    <label class="form-label">Gender<span class="required">*</span></label>
                    <select class="form-control" name="gender" id="gender">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="col-6">
                    <label class="form-label">Marital Status</label>
                    <select class="form-control" name="marital_status" id="marital_status">
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Qualification<span class="required">*</span></label>
                    <!--<input type="text" class="form-control" name="qualification" id="qualification">-->
                    <select class="form-control" name="qualification" id="qualification">
                        <option value="">select</option>
                        <option value="MTEC">M.TEC</option>
                        <option value="BTEC">B.TEC</option>
                        <option value="BSC IT">BSC IT</option>
                        <option value="MBA">MBA</option>
                        <option value="BBA">BBA</option>
                        <option value="MCA">MCA</option>
                        <option value="BCA">BCA</option>
                        <option value="MCOM">M.COM</option>
                        <option value="BCOM">B.COM</option>
                        <option value="DEGREE">DEGREE</option>
                        <option value="OTHERS">OTHERS</option>
                    </select>
                </div>
            </div>

        <div class="row mb-2">
            <div class="col-6">
                <label class="form-label">Join Date<span class="required">*</span></label>
                <input type="date" class="form-control" name="join_date" id="join_date_edit" >
            </div>
            <div class="col-6">
                <label class="form-label">Releaving Date</label>
                <input type="date" class="form-control" name="releaving_date" id="releaving_date_edit" >
            </div>
        </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Technology Stack</label>
                    <textarea rows=3 class="form-control" name="technology_stack" id="technology_stack"></textarea>
                    
                </div>
            </div>

            <!-- B. Contact Information -->
            <div class="form-section-title">B. Contact Information</div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Mobile Number<span class="required">*</span></label>
                    <input type="tel" class="form-control" name="mobile_number" id="mobile_number" required>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Alternative Number-1</label>
                    <input type="tel" class="form-control" name="alternative_number_1" id="alternative_number_1">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Alternative Number-2</label>
                    <input type="tel" class="form-control" name="alternative_number_2" id="alternative_number_2">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" id="email">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" name="address" id="address" rows="3"></textarea>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">City</label>
                    <input type="text" class="form-control" name="city" id="city">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">State</label>
                    <input type="text" class="form-control" name="state" id="state">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Country</label>
                    <select class="form-control" name="country" id="country">
                        <option value="">Select Country</option>
                        @foreach($countries as $country)
                            <option value="{{$country->name}}">{{$country->name}}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Emergency Contact Name</label>
                    <input type="text" class="form-control" name="emergency_contact_name" id="emergency_contact_name">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Emergency Contact Number</label>
                    <input type="tel" class="form-control" name="emergency_contact_number" id="emergency_contact_number">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Relationship</label>
                    <input type="text" class="form-control" name="relationship" id="relationship" placeholder="e.g., Spouse, Parent, Sibling">
                </div>
            </div>

            <!-- C. Employment Details -->
            <div class="form-section-title">C. Employment Details</div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Job Title / Position</label>
                    <input type="text" class="form-control" name="job_title" id="job_title">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Department</label>
                    <input type="text" class="form-control" name="department" id="department">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Date of Hire</label>
                    <input type="date" class="form-control" name="date_of_hire" id="date_of_hire">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Work Location</label>
                    <input type="text" class="form-control" name="work_location" id="work_location">
                </div>
            </div>

            <!-- D. Additional Details -->
            <div class="form-section-title">D. Additional Details</div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Aadhar Number</label>
                    <input type="text" class="form-control" name="aadhar_number" id="aadhar_number" maxlength="12">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-9">
                    <label class="form-label">Upload Aadhar</label>
                    <input type="file" class="form-control" name="aadhar_file" id="aadhar_file" accept=".pdf,.jpg,.jpeg,.png" onchange="previewAadharFile(event)">
                    <small class="text-muted">PDF, JPG, JPEG, PNG allowed</small>
                </div>
                <div class="col-3">
                    <div id="aadhar_file_preview" class="mt-2" style="display:none;">
                        <img id="preview_aadhar" src="" alt="Aadhar Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                    </div>
                    <div id="aadhar_pdf_preview" class="mt-2" style="display:none;">
                        <i class="bi bi-file-earmark-pdf" style="font-size: 50px; color: #dc3545;"></i>
                        <div><small>PDF Selected</small></div>
                    </div>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Pancard Number</label>
                    <input type="text" class="form-control" name="pancard_number" id="pancard_number" maxlength="10">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-9">
                    <label class="form-label">Upload Pancard</label>
                    <input type="file" class="form-control" name="pancard_file" id="pancard_file" accept=".pdf,.jpg,.jpeg,.png" onchange="previewPancardFile(event)">
                    <small class="text-muted">PDF, JPG, JPEG, PNG allowed</small>
                </div>
                <div class="col-3">
                    <div id="pancard_file_preview" class="mt-2" style="display:none;">
                        <img id="preview_pancard" src="" alt="Pancard Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                    </div>
                    <div id="pancard_pdf_preview" class="mt-2" style="display:none;">
                        <i class="bi bi-file-earmark-pdf" style="font-size: 50px; color: #dc3545;"></i>
                        <div><small>PDF Selected</small></div>
                    </div>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-9">
                    <label class="form-label">Upload Experience Certificate</label>
                    <input type="file" class="form-control" name="experience_certificate" id="experience_certificate" accept=".pdf,.jpg,.jpeg,.png" onchange="previewExperienceFile(event)">
                    <small class="text-muted">PDF, JPG, JPEG, PNG allowed</small>
                </div>
                <div class="col-3">
                    <div id="experience_file_preview" class="mt-2" style="display:none;">
                        <img id="preview_experience" src="" alt="Experience Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                    </div>
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-9">
                    <label class="form-label">Upload Other Document</label>
                    <input type="file" class="form-control" name="other_document" id="other_document" accept=".pdf,.jpg,.jpeg,.png" onchange="previewOtherDocumentFile(event)">
                    <small class="text-muted">PDF, JPG, JPEG, PNG allowed</small>
                </div>
                <div class="col-3">
                    <div id="other_document_preview" class="mt-2" style="display:none;">
                        <img id="preview_other_document" src="" alt="Other Document Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
                    </div>
                </div>
            </div>


            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Bank Name</label>
                    <input type="text" class="form-control" name="bank_name" id="bank_name">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Account Number</label>
                    <input type="text" class="form-control" name="account_number" id="account_number">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">IFSC Code</label>
                    <input type="text" class="form-control" name="ifsc_code" id="ifsc_code">
                </div>
            </div>

            <!-- F. Verification -->
            <div class="form-section-title">F. Verification</div>

            <div class="row mb-2">
                <div class="col-6">
                    <label class="form-label">Verified by</label>
                    <input type="text" class="form-control" name="verified_by" id="verified_by">
                </div>
            
                <div class="col-6">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" name="verification_date" id="verification_date">
                </div>
            </div>

            <div class="row mb-2">
                <div class="col-12">
                    <label class="form-label">Remarks</label>
                    <textarea class="form-control" name="verification_remarks" id="verification_remarks" rows="3"></textarea>
                </div>
            </div>

            <div class="row mb-2 mt-3">
                <div class="col-12 text-end">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="offcanvas">Close</button>
                    <button class="btn btn-primary" id="btn-submit" type="submit">Submit</button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Edit Employee Offcanvas -->
<div class="offcanvas offcanvas-end shadow border-start-0 p-2" id="edit-employee" style="width:30% !important;height:900px;overflow-y:auto;" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1">
    <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title">Edit Employee</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
    </div>
    <div class="offcanvas-body">
    </div>
</div>

@push('scripts')

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

<script src="{{asset('assets/intl-tel-input17.0.3/intlTelInput.min.js')}}"></script>

<script>

BASE_URL = {!! json_encode(url('/')) !!}

//---------------------------------------------------------------------------

var table = $('#datatable').DataTable({
    processing: true,
    serverSide: true,
    stateSave: true,
    paging: true,
    pageLength: 50,
    scrollX: true,

    'pagingType': "simple_numbers",
    'lengthChange': true,

    ajax: {
        url: BASE_URL + "/admin/view-employees",
        data: function (data) {
            //data.search = $('input[type="search"]').val();
        },
    },

    columns: [
        {"data": 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false},
        {"data": "profile_image"},
        {"data": "emp_id"},
        {"data": "name"},
        {"data": "mobile"},
        {"data": "job_title"},
        {"data": "department"},
        {"data": "status"},
        {"data": "action", name: 'Action', orderable: false, searchable: false},
    ],

});

// Add Employee Form Submit
$('#formAddEmployee').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);

    $("#btn-submit").attr('disabled', true).html('Saving <i class="fa fa-spinner fa-spin"></i>');

    $.ajax({
        url: "{{ url('admin/save-employee') }}",
        method: 'post',
        data: formData,
        processData: false,
        contentType: false,
        success: function(result) {
            if (result.status == 1 || result.status == true) {
                $("#btn-submit").attr('disabled', false).html('Submit');
                $('#datatable').DataTable().ajax.reload(null, false);
                toastr.success(result.msg);
                $('#formAddEmployee')[0].reset();
                $('#add-employee').offcanvas('hide');
            } else {
                $("#btn-submit").attr('disabled', false).html('Submit');
                toastr.error(result.msg);
            }
        },
        error: function(xhr) {
            $("#btn-submit").attr('disabled', false).html('Submit');
            toastr.error('Something went wrong. Please try again.');
        }
    });
});

// Delete Employee
$('#datatable tbody').on('click', '.delete-employee', function() {
    Swal.fire({
        text: "Are you sure, You want to delete this employee and all their data?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete it!"
    }).then((result) => {
        if (result.isConfirmed) {

            var tid = $(this).attr('id');

            $.ajax({
                url: "{{url('admin/delete-employee')}}" + '/' + tid,
                type: 'get',
                dataType: 'json',
                success: function (res) {
                    if (res.status == 1 || res.status == true) {
                        toastr.success(res.msg);
                        $("#datatable").DataTable().ajax.reload(null, false);
                    } else {
                        toastr.error(res.msg);
                    }
                }
            });

        }
    });

});

// Edit Employee
$('#datatable tbody').on('click', '.edit-employee', function() {

    var id = $(this).attr('id');
    var Result = $("#edit-employee .offcanvas-body");

    jQuery.ajax({
        type: "GET",
        url: "{{url('admin/edit-employee')}}" + "/" + id,
        dataType: 'html',
        success: function(res) {
            Result.html(res);
        }
    });
});

// Activate/Deactivate Employee
$("#datatable tbody").on('click', '.btn-act-deact', function() {
    var opt = $(this).data('option');
    var id = $(this).attr('id');

    var opt_text = (opt == 1) ? "activate" : "deactivate";
    optText = opt_text.charAt(0).toUpperCase() + opt_text.slice(1);

    Swal.fire({
        title: optText + "?",
        text: "You want to " + opt_text + " this employee?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, " + opt_text + " it!"
    }).then((result) => {
        if (result.isConfirmed) {

            jQuery.ajax({
                type: "get",
                url: BASE_URL + "/admin/act-deact-employee/" + opt + "/" + id,
                dataType: 'json',
                success: function(res) {
                    if (res.status == true) {
                        toastr.success(res.msg);
                        $('#datatable').DataTable().ajax.reload(null, false);
                    } else {
                        toastr.error(res.msg);
                    }
                }
            });
        }
    });

});

// Profile Image Preview Function
function previewProfileImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var output = document.getElementById('preview_img');
        output.src = reader.result;
        document.getElementById('profile_image_preview').style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Aadhar File Preview Function
function previewAadharFile(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide both previews first
        document.getElementById('aadhar_file_preview').style.display = 'none';
        document.getElementById('aadhar_pdf_preview').style.display = 'none';

        if (fileType === 'application/pdf') {
            // Show PDF icon
            document.getElementById('aadhar_pdf_preview').style.display = 'block';
        } else if (fileType.startsWith('image/')) {
            // Show image preview
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_aadhar');
                output.src = reader.result;
                document.getElementById('aadhar_file_preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
}

// Pancard File Preview Function
function previewPancardFile(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide both previews first
        document.getElementById('pancard_file_preview').style.display = 'none';
        document.getElementById('pancard_pdf_preview').style.display = 'none';

        if (fileType === 'application/pdf') {
            // Show PDF icon
            document.getElementById('pancard_pdf_preview').style.display = 'block';
        } else if (fileType.startsWith('image/')) {
            // Show image preview
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_pancard');
                output.src = reader.result;
                document.getElementById('pancard_file_preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
}

// Experience Certificate Preview Function (Image only, no PDF preview)
function previewExperienceFile(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide preview first
        document.getElementById('experience_file_preview').style.display = 'none';

        // Only show preview if it's an image
        if (fileType.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_experience');
                output.src = reader.result;
                document.getElementById('experience_file_preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        // If PDF, no preview shown (per requirement)
    }
}

// Other Document Preview Function (Image only, no PDF preview)
function previewOtherDocumentFile(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide preview first
        document.getElementById('other_document_preview').style.display = 'none';

        // Only show preview if it's an image
        if (fileType.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_other_document');
                output.src = reader.result;
                document.getElementById('other_document_preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        // If PDF, no preview shown (per requirement)
    }
}

// Reset preview when form is reset or offcanvas is closed
$('#add-employee').on('hidden.bs.offcanvas', function () {
    $('#profile_image_preview').hide();
    $('#preview_img').attr('src', '');
    $('#aadhar_file_preview').hide();
    $('#aadhar_pdf_preview').hide();
    $('#preview_aadhar').attr('src', '');
    $('#pancard_file_preview').hide();
    $('#pancard_pdf_preview').hide();
    $('#preview_pancard').attr('src', '');
    $('#experience_file_preview').hide();
    $('#preview_experience').attr('src', '');
    $('#other_document_preview').hide();
    $('#preview_other_document').attr('src', '');
});

</script>
@endpush
@endsection
