@extends('layouts.master')
@section('title','Dashboard')
@section('contents')
<style>
.card-body{
	padding-top:2px !important;
}
.card
{
	margin-bottom:1rem !important;
}
</style>

<link href="{{ asset('assets/intl-tel-input17.0.3/intlTelInput.min.css')}}" rel="stylesheet"/>

<!-- for message -------------->
		<input type="hidden" id="view_message" value="{{ Session::get('message') }}">
<!-- for message end-------------->	


<div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
              <div class="breadcrumb-title pe-3">User Profile</div>
 
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

              <div class="row">
			  
			 <div class="col-12 col-lg-4">
                <div class="card shadow-sm border-0 overflow-hidden">
                  <div class="card-body pt-3">
                      <div class="profile-avatar text-center mt-5">
					    <img src="{{$usr->user_logo}}" class="rounded-circle shadow" width="120" height="120" alt="">
					  </div>
					  
                      <!--<div class="d-flex align-items-center justify-content-around mt-5 gap-3">
                          <div class="text-center">
                            <h4 class="mb-0">45</h4>
                            <p class="mb-0 text-secondary">Friends</p>
                          </div>
                          <div class="text-center">
                            <h4 class="mb-0">15</h4>
                            <p class="mb-0 text-secondary">Photos</p>
                          </div>
                          <div class="text-center">
                            <h4 class="mb-0">86</h4>
                            <p class="mb-0 text-secondary">Comments</p>
                          </div>
                      </div> -->
					  
                      <div class="text-center mt-5 mb-3">
                        <h4 class="mb-1">{{ucfirst($usr->vchr_user_name)}}</h4>
                        <p class="mb-0 text-secondary">{{$usr->location}}</p>
                        <div class="mt-4"></div>
                        <h6 class="mb-1">{{$usr->designation}}</h6>
                        <p class="mb-2 text-secondary">{{$usr->address}}</p>
						
						<p class="mb-0 text-secondary">+{{$usr->vchr_user_mobile}}</p>
						<p class="mb-0 text-secondary">{{$usr->email}}</p>
						
                      </div>
					  
					  
                      <!--<hr>
					  
                    <!--<div class="text-start">
                        <h5 class="">About</h5>
                        <p class="mb-0">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem.
                      </div> -->
                  </div>
                  <!--<ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-top">
                      Followers
                      <span class="badge bg-primary rounded-pill">95</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                      Following
                      <span class="badge bg-primary rounded-pill">75</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
                      Templates
                      <span class="badge bg-primary rounded-pill">14</span>
                    </li>
                  </ul> -->
                </div>
				
				<div class="row row-cols-1 row-cols-sm-12 row-cols-md-12 row-cols-xl-12 row-cols-xxl-12">
				
				<div class="col">
					<div class="card radius-10">
					  <div class="card-body">
						<div class="d-flex align-items-center">
						  <div class="">
							<p class="mb-1 mt-3"> Subscription: 
								@if($subscription=="Active")
									(<span style="color:Green;">{{$subscription}}</span>)
								@else
									(<span style="color:red;">{{$subscription}}</span>)
								@endif 
							<i class="bi bi-arrow-right"></i>
							</p>
							<!--<h4 class="mb-0 text-primary">0</h4>-->
						  </div>
						  <div class="ms-auto fs-2 text-primary">
							<label class="mb-0 mt-3 text-primary fs-6">[ {{date_create($usr->subscription_start_date)->format('d-m-Y')}}
								&nbsp;&nbsp;<span class="text-red">=></span>&nbsp;&nbsp;
							{{date_create($usr->subscription_end_date)->format('d-m-Y')}} ] 
							</label>
						  </div>
						</div>
					  </div>
					</div>
				   </div>
				   
				  <div class="col">
					<div class="card radius-10">
					  <div class="card-body">
						<div class="d-flex align-items-center">
						  <div class="">
							<p class="mb-1 mt-3"> Total Scratch Count <i class="bi bi-arrow-right"></i></p>
							<!--<h4 class="mb-0 text-primary">0</h4>-->
						  </div>
						  <div class="ms-auto fs-2 text-primary">
							<h5 class="mb-0 mt-3 text-primary">{{$data['tot_count']??0}}</h5>
						  </div>
						</div>
					  </div>
					</div>
				   </div>
				   
				   <div class="col">
					<div class="card radius-10">
					  <div class="card-body">
						<div class="d-flex align-items-center">
						  <div class="">
							<p class="mb-1 mt-3">Total Scratch Used <i class="bi bi-arrow-right"></i></p>
							<!--<h4 class="mb-0 text-info">0</h4>-->
						  </div>
						  <div class="ms-auto fs-2 text-info">
							<h5 class="mb-0 mt-3 text-info">{{$data['used_count']??0}}</h5>
						  </div>
						</div>
					  </div>
					</div>
				   </div>
				   
				   
					<div class="col">
						<div class="card radius-10">
						  <div class="card-body">
							<div class="d-flex align-items-center">
							  <div class="">
								<p class="mb-1 mt-3">Balance Scratch Count <i class="bi bi-arrow-right"></i></p>
								<!--<h4 class="mb-0 text-purple">0</h4>-->
							  </div>
							  <div class="ms-auto fs-2 text-purple">
								<!--<i class="bi bi-chat-right"></i>-->
								<h5 class="mb-0 mt-3 text-purple">{{$data['bal_count']??0}}</h5>
							  </div>
							</div>
						  </div>
						</div>
					   </div>
				   
				</div>

								
              </div>
			  
			  
              <div class="col-12 col-lg-8">
                <div class="card shadow-sm border-0">
                  <div class="card-body">
						<div class="row">
							<h5 class="col-8 col-lg-8 col-xl-8 col-xxl-8 mb-2 mt-2">My Account</h5>
							<div class="col-4 col-lg-4 col-xl-4 col-xxl-4 mb-2 mt-2 text-right"><a class="btn btn-primary btn-sm" href="{{url('admin/users-list')}}">
							<i class="fa fa-arrow-left"></i> Back</a></div>
					  </div>
					  <hr>
					  
					  <div class="row">
					  <div class="col-12 col-lg-6 col-xl-6 col-xxl-6">
					  
					  
                      <div class="card shadow-none border">
                        <div class="card-header">
                          <h6 class="mb-0">Add Scratch Count</h6>
                        </div>
						
                        <div class="card-body">
						
							<form id="formAddScratchCount">
								@csrf
								<input type="hidden" name="user_id" id="user_id" value="{{$user_id}}">
								<fieldset  id="div_scratch_count" @if($subscription=="Expired"){{__('disabled')}}@endif>
								<div class="row mt-3 mb-2">
								
									<label class="col-12 col-lg-4 col-xl-4 col-xxl-4 col-form-label">Scratch Count<span class="required">*</span></label>
									<div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
										<input type="number" class="form-control"  name="scratch_count" id="scratch_count" placeholder="count" required>
									</div>
									<div class="col-12 col-lg-4 col-xl-4 col-xxl-4">
										<button type="submit" class="btn btn-primary px-4">Add Scratch</button>
									</div>
								</div>
								</fieldset>
							</form>
							
                        </div>
                      </div>
					  </div>
					  
					  <div class="col-12 col-lg-6 col-xl-6 col-xxl-6">
                      <div class="card shadow-none border">
                        <div class="card-header">
                          <h6 class="mb-0">Subscription </h6>
                        </div>
						
                        <div class="card-body">
						
							<form id="formAddSubscription">
								@csrf
								<input type="hidden" name="user_id" id="user_id" value="{{$user_id}}">
								
								<div class="row mt-3 mb-2" >
								<div class="col-12 col-lg-5 col-xl-5 col-xxl-5">
									<label >Start Date <span class="required">*</span></label>
									<input type="date" class="form-control"  name="start_date" id="start_date" placeholder="date from" required>
								</div>
								<div class="col-12 col-lg-5 col-xl-5 col-xxl-5">
									<label >End Date <span class="required">*</span></label>
									<input type="date" class="form-control"  name="end_date" id="end_date" placeholder="date to" required>
								</div>
								<div class="col-12 col-lg-2 col-xl-2 col-xxl-2">
										<label >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
										<button type="submit" class="btn btn-primary">Set</button>
									</div>
								</div>
							</form>
							
                        </div>
                      </div>
					  </div>
					</div>
					

                    <div class="card shadow-none border">
                        <div class="card-header">
                          <h6 class="mb-0">Scratch Purchase History</h6>
                        </div>
						
                        <div class="card-body">
						
						<input type="hidden" name="vendor_id" id="vendor_id" value="{{$user_id}}">
						
						<div class="table-responsive mt-3">
	
                             <table id="datatable" class="table align-middle" style="width:100% !important;" >
                               <thead class="table-semi-dark">
                                 <tr>
									<th>SlNo</th>
									<th>Date</th>
									<th>Narration</th>
									<th>Count</th>
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
              </div>
              
            </div><!--end row-->
			


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

var vid=$("#vendor_id").val();

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
			url:BASE_URL+"/admin/view-scratch-history"+"/"+vid,
			data: function (data) 
		    {
               //data.user_id = $('#vendor_id').val();
		    },
        },

        columns: [
            {"data": 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false  },
			{"data": "cdate" },
			{"data": "narration" },
			{"data": "scratch_count" },
			{"data": "action" ,name: 'Action',orderable: false, searchable: false },
        ],

});


				
var addValidator=$('#formAddScratchCount').validate({ 
	
	rules: {
		scratch_count: {required: true,},
	},

	submitHandler: function(form) 
	{

		$.ajax({
		url: "{{ url('admin/add-scratch-count') }}",
		method: 'post',
		data: $('#formAddScratchCount').serialize(),
		success: function(result){
			if(result.status == 1)
			{
				$('#datatable').DataTable().ajax.reload(null,false);
				toastr.success(result.msg);
				
				var asc=parseInt($("#scratch_bal_count").html());
				var psc=parseInt($("#scratch_count").val());
				$("#scratch_bal_count").html(asc+psc);
				$('#scratch_count').val('');
				location.reload();
			}
			else
			{
				toastr.error(result.msg);
			}
		}
		});
	  }
	});


var addValidator=$('#formAddSubscription').validate({ 
	
	rules: {
		start_date: {required: true,},
		end_date: {required: true,},
	},

	submitHandler: function(form) 
	{
		$.ajax({
		url: "{{ url('admin/add-subscription') }}",
		method: 'post',
		data: $('#formAddSubscription').serialize(),
		success: function(result){
			if(result.status == 1)
			{
				toastr.success(result.msg);
				location.reload();
			}
			else
			{
				toastr.error(result.msg);
			}
		}
		});
	  }
	});

$('#datatable tbody').on('click','.link-delete',function()
{
	
	var psc=parseInt($(this).closest('tr').find('td').eq(3).text());
	var asc=parseInt($("#scratch_bal_count").html());
	
	Swal.fire({
	  //title: "Are you sure?",
	  text: "Are you sure, You want to delete this scratch count entry?",
	  icon: "question",
	  showCancelButton: true,
	  confirmButtonColor: "#3085d6",
	  cancelButtonColor: "#d33",
	  confirmButtonText: "Yes, Delete it!"
	}).then((result) => {
	  if (result.isConfirmed) {
		
		var id=$(this).attr('id');
		var uid=$(this).data('userid');
		
		  $.ajax({
          url: "{{url('admin/delete-scratch-count')}}",
          type: 'get',
		  dataType: 'json',
          data:{'id':id,user_id:uid},
          success: function (res) 
		  {
			if(res.status==1)
			{
				 toastr.success(res.msg);
				 $("#datatable").DataTable().ajax.reload(null,false);
				 $("#scratch_bal_count").html(asc-psc);
				 location.reload();
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
