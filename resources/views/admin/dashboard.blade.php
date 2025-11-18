@extends('layouts.master')
@section('title','Dashboard')
@section('contents')
<style>
.theme-icons {
    background-color: #cdeaf3 !important;
    color: #434547;
}
</style>

<div class="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
    <div class="breadcrumb-title pe-3">Dashboard</div>
 </div>

<div class="row row-cols-1 row-cols-sm-4 row-cols-md-6 row-cols-xl-6 row-cols-xxl-6">
  <div class="col">
	<div class="card radius-10">
	  <div class="card-body">
		<div class="d-flex align-items-center">
		  <div class="">
			<p class="mb-1">Total Application</p>
			<h4 class="mb-0 text-pink">{{$ap_count}}</h4>
		  </div>
		  <div class="ms-auto fs-2 text-pink">
			<i class="bx bx-receipt"></i>
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
			<p class="mb-1">This Week</p>
			<h4 class="mb-0 text-info">{{$week_count}}</h4>
		  </div>
		  <div class="ms-auto fs-2 text-info">
			<i class="bx bx-receipt"></i>
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
				<p class="mb-1">This Month</p>
				<h4 class="mb-0 text-purple">{{$month_count}}</h4>
			  </div>
			  <div class="ms-auto fs-2 text-purple">
				<i class="bx bx-receipt"></i>
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
				<p class="mb-1">This Year</p>
				<h4 class="mb-0 text-primary">{{$year_count}}</h4>
			  </div>
			  <div class="ms-auto fs-2 text-primary">
				<i class="bx bx-receipt"></i>
			  </div>
			</div>
		  </div>
		</div>
	   </div>

  </div><!--end row-->
  


<div class="row">
  <div class="col-12 col-lg-6 d-flex">
	<div class="card radius-10 w-100">
	  <div class="card-body">
		<div class="d-flex align-items-center">
		  <h6 class="mb-0">Options </h6>
		</div>
		<hr/>
				
				{{--<input type="hidden" id="stud_years" value="{{$data['stud_years']}}">
				<input type="hidden" id="stud_count" value="{{$data['stud_cnt']}}">
				<input type="hidden" id="subs_count" value="{{$data['subs_cnt']}}"> --}}
								
				<div class="row">
					<div class="col-xl-12 mx-auto">
						<div class="chart-container1">
							<canvas id="chart21"></canvas>
						</div>
					</div>
				</div>
	  </div>
	</div>
  </div>
  
  <div class="col-12 col-lg-6 d-flex">
	<div class="card radius-10 w-100">
	  <div class="card-body">
		<div class="d-flex align-items-center">
		   <h6 class="mb-0">Options</h6>
		   </div>
			<hr/>
			
			{{--<input type="hidden" id="cr_lbl" value="{{$data['cr_lbl']}}">
			<input type="hidden" id="cr_cnt" value="{{$data['cr_cnt']}}"> --}}
				
				<div class="row">
					<div class="col-xl-12 mx-auto">
						<div class="chart-container1">
				  		   <canvas id="chart61"></canvas>
						</div>
					</div>
				</div>
		   
		   
		</div>
		<!-- content here -->
	  </div>
	</div>
  </div>
</div><!--end row-->

			
@push('scripts')
<script>

</script>
@endpush
@endsection
