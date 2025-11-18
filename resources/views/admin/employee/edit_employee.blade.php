<style>
.form-section-title {
    background: #f8f9fa;
    padding: 10px 15px;
    margin: 15px 0 10px 0;
    border-left: 4px solid #0d6efd;
    font-weight: 600;
    font-size: 14px;
}
</style>

<form id="formUpdateEmployee" enctype="multipart/form-data">
    @csrf

    <input type="hidden" name="employee_id_hidden" value="{{$employee->id}}">

    <!-- A. Personal Information -->
    <div class="form-section-title">A. Personal Information</div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Profile Image</label>
            @if($employee->profile_image)
                <div class="mb-2" id="current_profile_image">
                    <img src="{{config('constants.file_path').$employee->profile_image}}" width="80" height="80" class="img-thumbnail">
                </div>
            @endif
            <input type="file" class="form-control" name="profile_image" id="profile_image_edit" accept="image/*" onchange="previewProfileImageEdit(event)">
            <div id="profile_image_preview_edit" class="mt-2" style="display:none;">
                <img id="preview_img_edit" src="" alt="Profile Preview" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
            <small class="text-muted">Leave empty to keep current image</small>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Full Name<span class="required">*</span></label>
            <input type="text" class="form-control" name="full_name" id="full_name_edit" value="{{$employee->full_name}}" required>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-6">
            <label class="form-label">Employee ID<span class="required">*</span></label>
            <input type="text" class="form-control" name="employee_id" id="employee_id_edit" value="{{$employee->employee_id}}" required>
        </div>
        <div class="col-6">
            <label class="form-label">Date of Birth</label>
            <input type="date" class="form-control" name="date_of_birth" id="date_of_birth_edit" value="{{$employee->date_of_birth}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-6">
            <label class="form-label">Gender</label>
            <div class="mt-2">
               <select class="form-control" name="gender" id="gender_edit">
                        <option value="">Select</option>
                        <option value="Male" @if($employee->gender=="Male") __('selected') @endif>Male</option>
                        <option value="Female" @if($employee->gender=="Female") __('selected') @endif>Female</option>
                        <option value="Other" @if($employee->gender=="Other") __('selected') @endif>Other</option>
                    </select>
            </div>
        </div>
        <div class="col-6">
            <label class="form-label">Marital Status</label>
            <select class="form-control" name="marital_status" id="marital_status_edit">
                <option value="">Select</option>
                <option value="Single" {{$employee->marital_status == 'Single' ? 'selected' : ''}}>Single</option>
                <option value="Married" {{$employee->marital_status == 'Married' ? 'selected' : ''}}>Married</option>
                <option value="Divorced" {{$employee->marital_status == 'Divorced' ? 'selected' : ''}}>Divorced</option>
                <option value="Widowed" {{$employee->marital_status == 'Widowed' ? 'selected' : ''}}>Widowed</option>
            </select>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Qualification</label>
                <select class="form-control" name="qualification" id="qualification_edit">
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
            <input type="date" class="form-control" name="join_date" id="join_date_edit" value="{{$employee->join_date}}">
        </div>
        <div class="col-6">
            <label class="form-label">Releaving Date</label>
            <input type="date" class="form-control" name="releaving_date" id="releaving_date_edit" value="{{$employee->releaving_date}}">
        </div>
    </div>

    <!-- B. Contact Information -->
    <div class="form-section-title">B. Contact Information</div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Mobile Number<span class="required">*</span></label>
            <input type="tel" class="form-control" name="mobile_number" id="mobile_number_edit" value="{{$employee->mobile_number}}" required>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Alternative Number-1</label>
            <input type="tel" class="form-control" name="alternative_number_1" id="alternative_number_1_edit" value="{{$employee->alternative_number_1}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Alternative Number-2</label>
            <input type="tel" class="form-control" name="alternative_number_2" id="alternative_number_2_edit" value="{{$employee->alternative_number_2}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" name="email" id="email_edit" value="{{$employee->email}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Address</label>
            <textarea class="form-control" name="address" id="address_edit" rows="3">{{$employee->address}}</textarea>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">City</label>
            <input type="text" class="form-control" name="city" id="city_edit" value="{{$employee->city}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">State</label>
            <input type="text" class="form-control" name="state" id="state_edit" value="{{$employee->state}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Country</label>
            <select class="form-control" name="country" id="country_edit">
                <option value="">Select Country</option>
                @foreach($countries as $country)
                    <option value="{{$country->name}}" {{$employee->country == $country->name ? 'selected' : ''}}>{{$country->name}}</option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Emergency Contact Name</label>
            <input type="text" class="form-control" name="emergency_contact_name" id="emergency_contact_name_edit" value="{{$employee->emergency_contact_name}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Emergency Contact Number</label>
            <input type="tel" class="form-control" name="emergency_contact_number" id="emergency_contact_number_edit" value="{{$employee->emergency_contact_number}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Relationship</label>
            <input type="text" class="form-control" name="relationship" id="relationship_edit" value="{{$employee->relationship}}" placeholder="e.g., Spouse, Parent, Sibling">
        </div>
    </div>

    <!-- C. Employment Details -->
    <div class="form-section-title">C. Employment Details</div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Job Title / Position</label>
            <input type="text" class="form-control" name="job_title" id="job_title_edit" value="{{$employee->job_title}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Department</label>
            <input type="text" class="form-control" name="department" id="department_edit" value="{{$employee->department}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Date of Hire</label>
            <input type="date" class="form-control" name="date_of_hire" id="date_of_hire_edit" value="{{$employee->date_of_hire}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Work Location</label>
            <input type="text" class="form-control" name="work_location" id="work_location_edit" value="{{$employee->work_location}}">
        </div>
    </div>

    <!-- D. Additional Details -->
    <div class="form-section-title">D. Additional Details</div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Aadhar Number</label>
            <input type="text" class="form-control" name="aadhar_number" id="aadhar_number_edit" value="{{$employee->aadhar_number}}" maxlength="12">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-9">
            <label class="form-label">Upload Aadhar</label>
            @if($employee->aadhar_file)
                <div class="mb-2" id="current_aadhar_file">
                    <a href="{{config('constants.file_path').$employee->aadhar_file}}" target="_blank" class="btn btn-sm btn-info">View Current File</a>
                </div>
            @endif
            <input type="file" class="form-control" name="aadhar_file" id="aadhar_file_edit" accept=".pdf,.jpg,.jpeg,.png" onchange="previewAadharFileEdit(event)">
            <small class="text-muted">Leave empty to keep current file</small>
        </div>
        <div class="col-3">
            <div id="aadhar_file_preview_edit" class="mt-2" style="display:none;">
                <img id="preview_aadhar_edit" src="" alt="Aadhar Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
            <div id="aadhar_pdf_preview_edit" class="mt-2" style="display:none;">
                <i class="bi bi-file-earmark-pdf" style="font-size: 50px; color: #dc3545;"></i>
                <div><small>PDF Selected</small></div>
            </div>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Pancard Number</label>
            <input type="text" class="form-control" name="pancard_number" id="pancard_number_edit" value="{{$employee->pancard_number}}" maxlength="10">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-9">
            <label class="form-label">Upload Pancard</label>
            @if($employee->pancard_file)
                <div class="mb-2" id="current_pancard_file">
                    <a href="{{config('constants.file_path').$employee->pancard_file}}" target="_blank" class="btn btn-sm btn-info">View Current File</a>
                </div>
            @endif
            <input type="file" class="form-control" name="pancard_file" id="pancard_file_edit" accept=".pdf,.jpg,.jpeg,.png" onchange="previewPancardFileEdit(event)">
            <small class="text-muted">Leave empty to keep current file</small>
        </div>
        <div class="col-3">
            <div id="pancard_file_preview_edit" class="mt-2" style="display:none;">
                <img id="preview_pancard_edit" src="" alt="Pancard Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
            <div id="pancard_pdf_preview_edit" class="mt-2" style="display:none;">
                <i class="bi bi-file-earmark-pdf" style="font-size: 50px; color: #dc3545;"></i>
                <div><small>PDF Selected</small></div>
            </div>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-9">
            <label class="form-label">Upload Experience Certificate</label>
            @if($employee->experience_certificate)
                <div class="mb-2" id="current_experience_file">
                    <a href="{{config('constants.file_path').$employee->experience_certificate}}" target="_blank" class="btn btn-sm btn-info">View Current File</a>
                </div>
            @endif
            <input type="file" class="form-control" name="experience_certificate" id="experience_certificate_edit" accept=".pdf,.jpg,.jpeg,.png" onchange="previewExperienceFileEdit(event)">
            <small class="text-muted">PDF, JPG, JPEG, PNG allowed - Leave empty to keep current file</small>
        </div>
        <div class="col-3">
            <div id="experience_file_preview_edit" class="mt-2" style="display:none;">
                <img id="preview_experience_edit" src="" alt="Experience Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-9">
            <label class="form-label">Upload Other Document</label>
            @if($employee->other_document)
                <div class="mb-2" id="current_other_document">
                    <a href="{{config('constants.file_path').$employee->other_document}}" target="_blank" class="btn btn-sm btn-info">View Current File</a>
                </div>
            @endif
            <input type="file" class="form-control" name="other_document" id="other_document_edit" accept=".pdf,.jpg,.jpeg,.png" onchange="previewOtherDocumentFileEdit(event)">
            <small class="text-muted">PDF, JPG, JPEG, PNG allowed - Leave empty to keep current file</small>
        </div>
        <div class="col-3">
            <div id="other_document_preview_edit" class="mt-2" style="display:none;">
                <img id="preview_other_document_edit" src="" alt="Other Document Preview" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
            </div>
        </div>
    </div>


    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Bank Name</label>
            <input type="text" class="form-control" name="bank_name" id="bank_name_edit" value="{{$employee->bank_name}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Account Number</label>
            <input type="text" class="form-control" name="account_number" id="account_number_edit" value="{{$employee->account_number}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">IFSC Code</label>
            <input type="text" class="form-control" name="ifsc_code" id="ifsc_code_edit" value="{{$employee->ifsc_code}}">
        </div>
    </div>

    <!-- F. Verification -->
    <div class="form-section-title">F. Verification</div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Verified by</label>
            <input type="text" class="form-control" name="verified_by" id="verified_by_edit" value="{{$employee->verified_by}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" name="verification_date" id="verification_date_edit" value="{{$employee->verification_date}}">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-12">
            <label class="form-label">Remarks</label>
            <textarea class="form-control" name="verification_remarks" id="verification_remarks_edit" rows="3">{{$employee->verification_remarks}}</textarea>
        </div>
    </div>

    <div class="row mb-2 mt-3">
        <div class="col-12 text-end">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="offcanvas">Close</button>
            <button class="btn btn-primary" id="btn-update" type="submit">Update</button>
        </div>
    </div>
</form>

<script>
// Update Employee Form Submit
$('#formUpdateEmployee').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);

    $("#btn-update").attr('disabled', true).html('Updating <i class="fa fa-spinner fa-spin"></i>');

    $.ajax({
        url: "{{ url('admin/update-employee') }}",
        method: 'post',
        data: formData,
        processData: false,
        contentType: false,
        success: function(result) {
            if (result.status == 1 || result.status == true) {
                $("#btn-update").attr('disabled', false).html('Update');
                $('#datatable').DataTable().ajax.reload(null, false);
                toastr.success(result.msg);
                $('#edit-employee').offcanvas('hide');
            } else {
                $("#btn-update").attr('disabled', false).html('Update');
                toastr.error(result.msg);
            }
        },
        error: function(xhr) {
            $("#btn-update").attr('disabled', false).html('Update');
            toastr.error('Something went wrong. Please try again.');
        }
    });
});

// Profile Image Preview Function for Edit Form
function previewProfileImageEdit(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var output = document.getElementById('preview_img_edit');
        output.src = reader.result;
        document.getElementById('profile_image_preview_edit').style.display = 'block';
        // Hide the current image when new image is selected
        var currentImage = document.getElementById('current_profile_image');
        if (currentImage) {
            currentImage.style.display = 'none';
        }
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Aadhar File Preview Function for Edit Form
function previewAadharFileEdit(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide both previews first
        document.getElementById('aadhar_file_preview_edit').style.display = 'none';
        document.getElementById('aadhar_pdf_preview_edit').style.display = 'none';

        // Hide current file button when new file is selected
        var currentFile = document.getElementById('current_aadhar_file');
        if (currentFile) {
            currentFile.style.display = 'none';
        }

        if (fileType === 'application/pdf') {
            // Show PDF icon
            document.getElementById('aadhar_pdf_preview_edit').style.display = 'block';
        } else if (fileType.startsWith('image/')) {
            // Show image preview
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_aadhar_edit');
                output.src = reader.result;
                document.getElementById('aadhar_file_preview_edit').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
}

// Pancard File Preview Function for Edit Form
function previewPancardFileEdit(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide both previews first
        document.getElementById('pancard_file_preview_edit').style.display = 'none';
        document.getElementById('pancard_pdf_preview_edit').style.display = 'none';

        // Hide current file button when new file is selected
        var currentFile = document.getElementById('current_pancard_file');
        if (currentFile) {
            currentFile.style.display = 'none';
        }

        if (fileType === 'application/pdf') {
            // Show PDF icon
            document.getElementById('pancard_pdf_preview_edit').style.display = 'block';
        } else if (fileType.startsWith('image/')) {
            // Show image preview
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_pancard_edit');
                output.src = reader.result;
                document.getElementById('pancard_file_preview_edit').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
}

// Experience Certificate Preview Function for Edit Form (Image only)
function previewExperienceFileEdit(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide preview first
        document.getElementById('experience_file_preview_edit').style.display = 'none';

        // Hide current file button when new file is selected
        var currentFile = document.getElementById('current_experience_file');
        if (currentFile) {
            currentFile.style.display = 'none';
        }

        // Only show preview if it's an image
        if (fileType.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_experience_edit');
                output.src = reader.result;
                document.getElementById('experience_file_preview_edit').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        // If PDF, no preview shown
    }
}

// Other Document Preview Function for Edit Form (Image only)
function previewOtherDocumentFileEdit(event) {
    var file = event.target.files[0];
    if (file) {
        var fileType = file.type;

        // Hide preview first
        document.getElementById('other_document_preview_edit').style.display = 'none';

        // Hide current file button when new file is selected
        var currentFile = document.getElementById('current_other_document');
        if (currentFile) {
            currentFile.style.display = 'none';
        }

        // Only show preview if it's an image
        if (fileType.startsWith('image/')) {
            var reader = new FileReader();
            reader.onload = function() {
                var output = document.getElementById('preview_other_document_edit');
                output.src = reader.result;
                document.getElementById('other_document_preview_edit').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
        // If PDF, no preview shown
    }
}
</script>
