@extends('layouts.master')
@section('title','Dashboard')
@section('contents')
<style>
.card-body{
	padding-top:2px !important;
}
	
</style>

<link href="{{ asset('assets/intl-tel-input17.0.3/intlTelInput.min.css')}}" rel="stylesheet"/>

<!-- for message -------------->
		<input type="hidden" id="view_message" value="{{ Session::get('message') }}">
<!-- for message end-------------->	


<div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
              <div class="breadcrumb-title pe-3">Admin Users</div>
 
             <!-- <div class="ms-auto">
                <div class="btn-group">
                  <button type="button" class="btn btn-primary">Settings</button>
                  <button type="button" class="btn btn-primary split-bg-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">	<span class="visually-hidden">Toggle Dropdown</span>
                  </button>
                  <div class="dropdown-menu dropdown-menu-right dropdown-menu-lg-end">	<a class="dropdown-item" href="javascript:;">Action</a>
                    <a class="dropdown-item" href="javascript:;">Another action</a>
                    <a class="dropdown-item" href="javascript:;">Something else here</a>
                    <div class="dropdown-divider"></div>	<a class="dropdown-item" href="javascript:;">Separated link</a>
                  </div>
                </div>
              </div>  -->
            </div>
            <!--end breadcrumb-->

              <div class="card">
                <div class="card-header p-y-3">
				<div class="row">
				<div class="col-lg-9 col-xl-9 col-xxl-9 col-9">
                  <h6 class="mb-0 pt5">Add/List Users</h6>
				  </div>
				  <div class="col-lg-3 col-xl-3 col-xxl-3 col-3 text-right">
				     <!--<a href="#" class="btn btn-gl-primary btn-xs"  data-bs-toggle="offcanvas" data-bs-target="#add-user" ><i class="fa fa-plus"></i>&nbsp;Add User</a>-->
				  </div>

				  </div>
                </div>
                <div class="card-body">
					
                   <div class="row mt-3">
				   <div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
				   					
				   <form id="formAddUser">
						@csrf
						<div class="row mb-2" >
							<div class="col-11 col-lg-11 col-xl-11 col-xxl-11">
								<label for="user_name" class="form-label">Name<span class="required">*</span></label>
								<input type="text" class="form-control"  name="user_name" id="user_name" placeholder="Name" required>
							</div>
						</div>
						
						<div class="row mb-2" >
							<div class="col-11 col-lg-11 col-xl-11 col-xxl-11">
								<label for="email" class="form-label">Email<span class="required">*</span></label>
								<input type="text" class="form-control"  name="email" id="email" placeholder="Email" required>
							</div>
						</div>

						<div class="row mb-2" >
							<div class="col-11 col-lg-11 col-xl-11 col-xxl-11">
								<label for="mobile" class="form-label">Mobile<span class="required">*</span></label>
								<input type="hidden" class="form-control" name="country_code" id="country_code" value="91"  required>
								<br>
								<input type="tel" class="form-control" name="mobile" id="mobile" minlength=6 maxlength=15 required>
							</div>
						</div>

						<div class="row mb-2" >
							<div class="col-11 col-lg-11 col-xl-11 col-xxl-11">
								<label>Password<span class="required">*</span></label>
								<input type="text" class="form-control"  name="password" id="password" value="123456" placeholder="Password" required>
							</div>
						</div>
						
						<div class="row mb-2">
							<div class="col-lg-11 col-xl-11 col-xxl-11 text-end">
							<button class="btn btn-primary" id="btn-submit" type="submit"> Submit </button>
							</div>
						</div>
						</form>
				   
				    </div>
                    
					<div class="col-12 col-lg-8 col-xl-8 col-xxl-8">
					 
                      <div class="card  shadow-none w-100 mt-3">
                        <!--<div class="card-body">-->
                          <div class="table-responsive">
	
                             <table id="datatable" class="table align-middle" style="width:100% !important;" >
                               <thead class="table-semi-dark">
                                 <tr>
									<th>SlNo</th>
									<th>Name</th>
									<th>Email</th>
									<th>Mobile</th>
									<th>Status</th>
									<th class="no-content" style="width:50px;">Action</th>
								</tr>
                               </thead>
                               <tbody>
                                  
                               </tbody>
                             </table>
                          </div>

                       <!-- </div>-->
                      </div> 
                    </div>
                   </div><!--end row-->
                </div>
              </div>
			  
			
	<div class="offcanvas offcanvas-end shadow border-start-0 p-2" id="add-user" style="width:25% !important" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" aria-modal="true" role="dialog">
          <div class="offcanvas-header border-bottom">
            <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Add User</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
          </div>
			<div class="offcanvas-body">

			
			  
            </div>
    </div>
		
		
		
	
	<div class="offcanvas offcanvas-end shadow border-start-0 p-2" id="edit-user" style="width:25% !important" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" aria-modal="true" role="dialog">
          <div class="offcanvas-header border-bottom">
            <h5 class="offcanvas-title" id="offcanvasScrollingLabel">Edit User</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
          </div>
			<div class="offcanvas-body">
  
            </div>
    </div>



<div class="modal fade" id="add-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-xxl">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="exampleModalLabel">Add</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			
			<div class="modal-body">
			

	
				<div class="modal-footer">
							<div class="col-lg-12 col-xl-12 col-xxl-12 text-end">
							<button type="button" class="btn btn-danger" data-bs-dismiss="modal" aria-label="Close">Close</button>
							<button class="btn btn-primary" type="submit"> Submit </button>
							</div>
				</div>
				
			</div>
		</div>
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

BASE_URL ={!! json_encode(url('/')) !!}


var phone_number = window.intlTelInput(document.querySelector("#mobile"), {
	  separateDialCode: true,
	  preferredCountries:["in"],
	  hiddenInput: "full_number",
	  utilsScript:"{{url('assets/intl-tel-input17.0.3/utils.js')}}"
	});


/*
var mes=$('#view_message').val().split('#');

if(mes[0]=="success")
{	
	toastr.success(mes[1]);
}
else if(mes[0]=="danger")
{
	toastr.error(mes[1]);
}
*/

//---------------------------------------------------------------------------


var table = $('#datatable').DataTable({
        processing: true,
        serverSide: true,
		stateSave:true,
		paging     : true,
        pageLength :50,
		scrollX: true,
		
		'pagingType':"simple_numbers",
        'lengthChange': true,
			
		ajax:
		{
			url:BASE_URL+"/admin/view-users",
			data: function (data) 
		    {
               //data.search = $('input[type="search"]').val();
		    },
        },

        columns: [
            {"data": 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false  },
			{"data": "name" },
			{"data": "email" },
			{"data": "user_mobile" },
			{"data": "status" },
			{"data": "action" ,name: 'Action',orderable: false, searchable: false },
        ],

});

				
var addValidator=$('#formAddUser').validate({ 
	
	rules: {
		user_name: {required: true,},
		email: {required: true,},
		password: {required: true,minlength:6, maxlength:15},
		mobile: {required: true,},
	},

	submitHandler: function(form) 
	{
		//$("#btn-submit").attr('disabled',true).html('Saving <i class="fa fa-spinner fa-spin"></i>')
		
		var code=phone_number.getSelectedCountryData()['dialCode'];
		$("#country_code").val(code);
		
		$.ajax({
		url: "{{ url('admin/save-user') }}",
		method: 'post',
		data: $('#formAddUser').serialize(),
		success: function(result){
			if(result.status == 1)
			{
				$("#btn-submit").attr('disabled',false).html('Submit')
				$('#datatable').DataTable().ajax.reload(null,false);
				toastr.success(result.msg);
				$('#formAddUser')[0].reset();
			}
			else
			{
				toastr.error(result.msg);
			}
		}
		});
	  }
	});



$('#datatable tbody').on('click','.delete-user',function()
{
	Swal.fire({
	  //title: "Are you sure?",
	  text: "Are you sure, You want to delete this user and it's all data?",
	  icon: "question",
	  showCancelButton: true,
	  confirmButtonColor: "#3085d6",
	  cancelButtonColor: "#d33",
	  confirmButtonText: "Yes, Delete it!"
	}).then((result) => {
	  if (result.isConfirmed) {
		
		var tid=$(this).attr('id');
		
		  $.ajax({
          url: "{{url('admin/delete-user')}}"+'/'+tid,
          type: 'get',
		  dataType: 'json',
          //data:{'track_id':tid},
          success: function (res) 
		  {
			if(res.status==1)
			{
				 toastr.success(res.msg);
				 $("#datatable").DataTable().ajax.reload(null,false);
			}
			else
			{
				 toastr.error(res.msg);
			}
          }
		});

	  }
	});

});
 

$('#datatable tbody').on('click','.edit-user',function()
{

	var id=$(this).attr('id');
	var Result=$("#edit-user .offcanvas-body");

			jQuery.ajax({
			type: "GET",
			url: "{{url('admin/edit-user')}}"+"/"+id,
			dataType: 'html',
			//data: {vid: vid},
			success: function(res)
			{
			   Result.html(res);
			}
		});
});


$("#datatable tbody").on('click','.btn-act-deact',function()
{
	var opt=$(this).data('option');
	var id=$(this).attr('id');
	
	var opt_text=(opt==1)?"activate":"deactivate";
	optText=opt_text.charAt(0).toUpperCase()+opt_text.slice(1);
	
	Swal.fire({
	  title: optText+"?",
	  text: "You want to "+opt_text+" this user?",
	  icon: "warning",
	  showCancelButton: true,
	  confirmButtonColor: "#3085d6",
	  cancelButtonColor: "#d33",
	  confirmButtonText: "Yes, "+opt_text+" it!"
	}).then((result) => {
	  if (result.isConfirmed) {
		
		
		  jQuery.ajax({
			type: "get",
			url: BASE_URL+"/admin/act-deact-user/"+opt+"/"+id,
			dataType: 'json',
			//data: {vid: vid},
			success: function(res)
			{
			   if(res.status==true)
			   {
				   toastr.success(res.msg);
				   $('#datatable').DataTable().ajax.reload(null, false);
			   }
			   else
			   {
				 toastr.error(res.msg); 
			   }
			}
		  });
	  }
	});

});





</script>
@endpush
@endsection
