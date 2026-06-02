/**
 * Loan Repayment Calculator — Application Logic
 *
 * Author : Ron Taylor
 * Date   : March 18, 2021
 *
 * Responsibilities:
 *   - Validate all five form inputs (loan amount, installment, interest rate,
 *     interval, and start date) and show/hide inline error messages.
 *   - Compute an amortisation schedule that skips weekend payment dates.
 *   - Render a summary stats card, a Chart.js doughnut chart, the full
 *     repayment schedule table, and Print / Export CSV action buttons.
 */

$(document).ready(function(){

	// Prevent the native form submission so all handling stays in JS.
	$('form').submit(function (evt) {
	   evt.preventDefault();

	});

	// Hide all inline validation messages on page load.
	 $("#loanTextError").find(".message").hide();
 	$("#installmentTextError").find(".message").hide();
	$("#interestTextError").find(".message").hide();
	$("#intervalTextError").find(".message").hide();
 	$("#dateTextError").find(".message").hide();

	// Attach the Bootstrap Datepicker to the date input.
     var date_input=$('input[name="date"]');

     var container=$('.repay').length>0 ? $('.repay').parent() : "body";
     var options={
       format: 'mm/dd/yyyy',
       container: container,
       todayHighlight: true,
       autoclose: true,
     };
     date_input.datepicker(options);
	 
	/**
	 * Round `value` to `decimals` decimal places using the exponential trick,
	 * which avoids floating-point drift from Math.round on mid-point values.
	 */
	var round=function(value, decimals) {
	   return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	 } ;

	 /**
	  * Return true if `day` falls on a Saturday (6) or Sunday (0).
	  * Used to skip non-business days when advancing payment dates.
	  */
	 var weekend = function(day) {
		 if (day.getDay() == 6 || day.getDay() == 0) {
			 return true;
		 } else {
			 return false;
		 }
	 };

	 /**
	  * Return a new Date that is `days` calendar days after `date`.
	  * The original Date object is never mutated.
	  */
	 var addDays = function(date, days) {
	     var result = new Date(date.valueOf());
	     result.setDate(result.getDate() + days);
	     return result;
	 };

	 /**
	  * Return true if `value` can be parsed as a finite number.
	  * Explicitly rejects the string "NaN" that parseFloat would not catch.
	  */
	 var isFloat = function(value){
		 if(value == "NaN" || value.toString() == "NaN")
			 return false;
		 value = parseFloat(value);
		 if(isNaN(value))
			 return false;
		 else {
			 return true;
		 }
	 };

	 /** Return true if `d` is a valid Date object (not Invalid Date). */
	 var isValidDate = function(d) {
	   return d instanceof Date && !isNaN(d);
	 };

	 /** Format a number as a locale USD string, always with two decimal places. */
	 var formatCurrency = function(num) {
	   return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	 };

	 // Reset: clear every form field, wipe the result area, and hide all error messages.
	 $("#ResetForm").click(function() {
	   $(".repayment")[0].reset();
	   $("#result").html("");
	   $("#loanTextError, #installmentTextError, #interestTextError, #intervalTextError, #dateTextError")
	     .find(".message").hide();
	 });

	 // Calculate button: validate inputs, run the amortisation loop, render results.
     $("#RunProgram").click(function(){

		 // --- 1. Read raw values from the form ---
		 var loan_amount = $("#loanInput").val();
		 var installment_amount = $("#installmentInput").val();
		 var interest_rate = $("#interestInput").val();
		 var start_date = new Date($("#dateInput").val());
		 var installment_interval = $('#intervalInput').find(":selected").text();

		 // Strip leading/trailing whitespace from text inputs.
		 loan_amount = loan_amount.trim();
		 installment_amount = installment_amount.trim();
		 interest_rate = interest_rate.trim();

		 // Validation flags — each flips to false if its field fails.
		 var lv = true;var ia = true;var ir = true;var ii = true;var sd = true;
		 
		
		 // --- 2. Validate each field and show/hide its error message ---

		 // Loan must be a positive finite number.
		 if(loan_amount == "" || isFloat(loan_amount) == false || round(loan_amount,2) <= 0.00  || round(loan_amount,2) >= Number.POSITIVE_INFINITY){
			 lv = false;
			 $("#loanTextError").find(".message").show();
		 }
		 else{
			 lv = true;
			 $("#loanTextError").find(".message").hide();
			 
		 }


		 // Installment must be positive and strictly less than the loan amount.
		 if( installment_amount == "" || isFloat(installment_amount)== false || round(installment_amount,2) <= 0.00 || round(installment_amount,2) >= round(loan_amount,2) ){
		 	 ia = false;
			$("#installmentTextError").find(".message").show();
		 }else{
			 ia = true;
			 $("#installmentTextError").find(".message").hide();
			 
			 
		 }
		 
		 // Interest rate: 0 % is allowed (interest-free loan); 100 % and above are rejected.
		 if( interest_rate == "" || isFloat(interest_rate) == false  || parseFloat(interest_rate) < 0.00 || parseFloat(interest_rate) >= 100.00 ){
		 	ir =false;
			$("#interestTextError").find(".message").show();
		 }else{
			 ir = true;
			 $("#interestTextError").find(".message").hide();
		 }
		 
		 
		 // Interval must be one of the three dropdown values.
		 if(installment_interval == "" || (installment_interval  != "Weekly" && installment_interval  != "Daily" && installment_interval  != "Monthly") ){
		 	ii =false;
			$("#intervalTextError").find(".message").show();
		 }else{
			 $("#intervalTextError").find(".message").hide();
			 ii = true;
		 }

		 
		 // Start date must parse to a real calendar date.
		 if(isValidDate(start_date) == false){
			  sd = false;
		 	$("#dateTextError").find(".message").show();
		 }else{
			 sd = true;
			 $("#dateTextError").find(".message").hide();
		 }
		 

		 // --- 3. All fields valid — run the amortisation loop ---
		 if(lv && sd && ii && ia && ir){
			 $("#loanTextError").find(".message").hide();
		 	$("#installmentTextError").find(".message").hide();
			$("#interestTextError").find(".message").hide();
			$("#intervalTextError").find(".message").hide();
		 	$("#dateTextError").find(".message").hide();
		 
		
		 
		  // Build the schedule HTML and CSV string simultaneously inside the while loop.
		 var duration_counter = 1;
		 var schedulelist = `
		 		 <h2 class="text-center">RE-PAYMENT SCHEDULE LIST</h2>
		 		<table class="table result_set table-bordered table-striped">
		 			<thead>
						<tr>
						      <th scope="col">Event</th>
		 				     <th scope="col">Date of Payment</th>
						      <th scope="col"> $ Loan</th>
						      <th scope="col"> $ Payment</th>
						      <th scope="col"> $ Interest</th>
		 				      <th scope="col">$ Principal</th>
		 				     <th scope="col">$ Balance</th>
						    </tr>
					</thead>
		 			 <tbody>
		 		
		 
		 
		 `;
		 var csvData = "Event,Date of Payment,$ Loan,$ Payment,$ Interest,$ Principal,$ Balance\n";
		 var grand = 0.00;
		 var interest_amount = parseFloat(0.00);
		 var principal_interval_amount = parseFloat(0.00);
		 var original_loan_amount = parseFloat(loan_amount);
		 var begin_loan_amount = original_loan_amount;
		 loan_amount = round(loan_amount,2);
		 var current_date = new Date(start_date.getTime());
		 


		 // Date format used for every row in the table and the grand total.
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

		 	// Convert percentage to decimal (e.g. 6 → 0.06).
			 interest_rate =(interest_rate / 100);
			 
			  var dateoutput =  null;
			 
			 while(loan_amount > 0.00){
				 begin_loan_amount = loan_amount;

				  //Advance the date first, then capture it as the payment due date
				 if(installment_interval == "Monthly"){
					  current_date.setMonth(current_date.getMonth() + 1);
					  while(weekend(current_date) == true){
					   current_date = addDays(current_date, 1);
				   	 }
				 } else if(installment_interval == "Weekly"){
					  current_date = addDays(current_date, 7);
					  while(weekend(current_date) == true){
					   current_date = addDays(current_date, 1);
				   	 }
				 } else if(installment_interval == "Daily"){
					  current_date = addDays(current_date, 1);
					  while(weekend(current_date) == true){
					   current_date = addDays(current_date, 1);
				   	 }
				 }

				 dateoutput = new Date(current_date.getTime());

				  // --- 4. Compute interest for this interval ---
				  // Monthly: annual_rate/12 | Weekly: annual_rate/48 | Daily: annual_rate/336
				 if(installment_interval == "Monthly"){
	   				  interest_amount = round((loan_amount * interest_rate) / 12, 2);
				 } else if(installment_interval == "Weekly"){
					  interest_amount = round((loan_amount * interest_rate) / (12 * 4), 2);
				 } else if(installment_interval == "Daily"){
	   				  interest_amount = round((loan_amount * interest_rate) / (12 * 4 * 7), 2);
				 }
				  
				  
 				 // Cap the final installment so it never exceeds the remaining balance + interest.
				  if((loan_amount + interest_amount) < installment_amount){
					  installment_amount = loan_amount + interest_amount;
				  }
				  

				  // Principal paid this period = installment minus interest portion.
				  principal_interval_amount = installment_amount - interest_amount;
				  principal_interval_amount = round(principal_interval_amount,2);


				  // Reduce the outstanding balance by the principal paid.
				  loan_amount = loan_amount - principal_interval_amount;
				  loan_amount = round(loan_amount,2);
 				 

 				   // Running grand total of all payments (used to derive total interest at the end).
				  grand = round(parseFloat(installment_amount) + parseFloat(grand), 2);
			 // Guard: if interest exceeds installment or any value is non-finite, abort.
			 if(round(interest_amount,2) > round(installment_amount,2) ||  round(principal_interval_amount,2) < 0.00 || !isFloat(begin_loan_amount) || !isFloat(installment_amount) || !isFloat(interest_amount) || !isFloat(principal_interval_amount)){
					  alert("An unexpected error occured, Please check inputs.");
					$("#result").html("");
					return;
				  }
				  
				 
				 
				 
				  // --- 5. Append row to HTML table and CSV string ---
				  schedulelist += `
						<tr>
						      <th scope="row">Payment `+duration_counter+`</th>
				  		      <td>`+dateoutput.toLocaleDateString("en-US", options)+`</td>
						      <td>`+round(begin_loan_amount,2)+`</td>
				  		      <td>`+round(installment_amount,2)+`</td>
				  		      <td>`+interest_amount+`</td>
				  		      <td>`+round(principal_interval_amount,2)+`</td>
				  		      <td>`+round(loan_amount,2)+`</td>
						    </tr>
				  
				  `;

				  csvData += "Payment " + duration_counter + ","
				    + '"' + dateoutput.toLocaleDateString("en-US", options) + '"' + ","
				    + round(begin_loan_amount, 2) + ","
				    + round(installment_amount, 2) + ","
				    + interest_amount + ","
				    + round(principal_interval_amount, 2) + ","
				    + round(loan_amount, 2) + "\n";

				  duration_counter += 1;
			 }

			 
		  // Derived summary values
		  var paymentCount = duration_counter - 1;
		  var totalInterest = round(parseFloat(grand) - parseFloat(original_loan_amount), 2);
		  var payoffDate = dateoutput.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

		  // Summary stats card (injected above the table)
		  var summaryHtml = `
		    <div class="summary-card">
		      <div class="stat-box">
		        <div class="stat-label">Loan Amount</div>
		        <div class="stat-value">$`+formatCurrency(original_loan_amount)+`</div>
		      </div>
		      <div class="stat-box">
		        <div class="stat-label">Total Paid</div>
		        <div class="stat-value">$`+formatCurrency(grand)+`</div>
		      </div>
		      <div class="stat-box">
		        <div class="stat-label">Total Interest</div>
		        <div class="stat-value">$`+formatCurrency(totalInterest)+`</div>
		      </div>
		      <div class="stat-box">
		        <div class="stat-label">No. of Payments</div>
		        <div class="stat-value">`+paymentCount+`</div>
		      </div>
		      <div class="stat-box">
		        <div class="stat-label">Payoff Date</div>
		        <div class="stat-value">`+payoffDate+`</div>
		      </div>
		    </div>
		    <div class="chart-wrapper">
		      <h6 class="text-center text-muted">Principal vs Interest</h6>
		      <canvas id="loanChart"></canvas>
		    </div>
		  `;

		  // Grand total row closes the table
		  schedulelist += `
				<tr>
				      <th scope="row">Grand Total </th>
		  		      <td><b>`+dateoutput.toLocaleDateString("en-US", options)+`</b></td>
				      <td><b>`+round(original_loan_amount,2)+`</b></td>
		  		      <td><b>`+round(grand,2)+`</b></td>
			 		<td><b>`+totalInterest+`</b></td>
		  		      <td><b>`+round(original_loan_amount,2)+`</b></td>
			 	      <td><b>`+round(loan_amount,2)+`</b></td>
				</tr>
				</tbody>
			 	</table>
		  `;

		  // CSV grand total row
		  csvData += "Grand Total,"
		    + '"' + dateoutput.toLocaleDateString("en-US", options) + '"' + ","
		    + round(original_loan_amount, 2) + ","
		    + round(grand, 2) + ","
		    + totalInterest + ","
		    + round(original_loan_amount, 2) + ","
		    + round(loan_amount, 2) + "\n";

		  // Action buttons (Print and Export CSV)
		  var buttonsHtml = `
		    <div class="action-buttons">
		      <button class="btn btn-outline-secondary" id="printBtn">
		        <i class="fa fa-print"></i> Print
		      </button>
		      <button class="btn btn-outline-success" id="exportBtn">
		        <i class="fa fa-download"></i> Export CSV
		      </button>
		    </div>
		  `;

		  // Render everything into the result div
		  $("#result").html(summaryHtml + schedulelist + buttonsHtml);

		  // Donut chart: Principal vs Interest
		  var ctx = document.getElementById("loanChart").getContext("2d");
		  new Chart(ctx, {
		    type: "doughnut",
		    data: {
		      labels: ["Principal", "Total Interest"],
		      datasets: [{
		        data: [round(original_loan_amount, 2), totalInterest],
		        backgroundColor: ["#28a745", "#ffc107"],
		        borderColor: ["#fff", "#fff"],
		        borderWidth: 3
		      }]
		    },
		    options: {
		      responsive: true,
		      plugins: {
		        legend: { position: "bottom" },
		        tooltip: {
		          callbacks: {
		            label: function(context) {
		              return context.label + ": $" + parseFloat(context.parsed)
		                .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		            }
		          }
		        }
		      }
		    }
		  });

		  // Smooth scroll to results
		  $("html, body").animate({ scrollTop: $("#result").offset().top - 20 }, 600);

		  // Print button
		  $("#printBtn").click(function() {
		    window.print();
		  });

		  // Export CSV button
		  $("#exportBtn").click(function() {
		    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
		    var url = URL.createObjectURL(blob);
		    var link = document.createElement("a");
		    link.href = url;
		    link.download = "repayment-schedule.csv";
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		    URL.revokeObjectURL(url);
		  });
		 }
		   
		   
       })
	 
  })