$(function () {
	"use strict";
	// chart 1
	/*var ctx = document.getElementById('chart1').getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
			datasets: [{
				label: 'Google',
				data: [6, 20, 14, 12, 17, 8, 10],
				backgroundColor: "transparent",
				borderColor: "#3461ff",
				pointRadius: "0",
				borderWidth: 4
			}, {
				label: 'Facebook',
				data: [5, 30, 16, 23, 8, 14, 11],
				backgroundColor: "transparent",
				borderColor: "#0c971a",
				pointRadius: "0",
				borderWidth: 4
			}]
		},
		options: {
			maintainAspectRatio: false,
			legend: {
				display: true,
				labels: {
					fontColor: '#585757',
					boxWidth: 40
				}
			},
			tooltips: {
				enabled: false
			},
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: true,
						fontColor: '#585757'
					},
					gridLines: {
						display: true,
						color: "rgba(0, 0, 0, 0.07)"
					},
					
				}],
				
				yAxes: [{
					ticks: {
						beginAtZero: true,
						fontColor: '#585757'
					},
					gridLines: {
						display: true,
						color: "rgba(0, 0, 0, 0.07)"
					},
				}]
			}
		}
	});
	
	*/
	
	// chart 2
	var ctx = document.getElementById("chart2").getContext('2d');
	
	var lbl=document.getElementById("stud_years").value;
	var lb_dat=document.getElementById("stud_count").value;
	var lb_sub=document.getElementById("subs_count").value;
	
	var label1=lbl.split(',');
	var lbl_count=lb_dat.split(',');
	var lbl_subs=lb_sub.split(',');
	
	var myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: label1 , /*[2020, 2021, 2022, 2023, 2024],*/
			datasets: [{
				label: 'Student',
				data: lbl_count, /*[ 198, 220, 214, 198, 265],*/
				barPercentage: .5,
				backgroundColor: "#3461ff"
			}, {
				label: 'Subscription',
				data: lbl_subs, /* [188, 210, 214, 188, 260],*/
				barPercentage: .5,
				backgroundColor: "#7997ff"
			}]
		},
		options: {
			maintainAspectRatio: false,
			legend: {
				display: true,
				labels: {
					fontColor: '#585757',
					boxWidth: 40
				}
			},
			tooltips: {
				enabled: true
			},
			scales: {
				xAxes: [{
					barPercentage: .4,
					ticks: {
						beginAtZero: true,
						fontColor: '#585757'
					},
					gridLines: {
						display: true,
						color: "rgba(0, 0, 0, 0.07)"
					},
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						fontColor: '#585757'
					},
					gridLines: {
						display: true,
						color: "rgba(0, 0, 0, 0.07)"
					},
				}]
			}
		}
	});
	
	// chart 6
	
	var cr_lbl=document.getElementById("cr_lbl").value;
	var cr_cnt=document.getElementById("cr_cnt").value;
	
	var cr_lbl1=cr_lbl.split(',');
	var cr_cnt1=cr_cnt.split(',');
	
	const dt = new Date();
	const fullYear = dt.getFullYear();
	
	
	new Chart(document.getElementById("chart6"), {
		type: 'doughnut',
		data: {
			labels: cr_lbl1, /* ["LDC", "SCERT", "NCRT", "PC", "SEC.ASST",'HS-ASST','SI'],*/
			datasets: [{
				label: "Students",
				backgroundColor: ["#0d6efd", "#212529", "#17a00e", "#f41127","#ffc107", "#055160","#fac245"],
				data: cr_cnt1 /*[200, 210, 180, 178, 188,190,210]*/
			}]
		},
		options: {
			maintainAspectRatio: false,
			title: {
				display: true,
				text: "Course wise Subscriptions in "+fullYear
			}
		}
	});
	
	
	
});