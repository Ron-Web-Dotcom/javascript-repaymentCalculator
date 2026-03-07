/* Author : Ron Taylor 
*
*
* DATE  MARCH 18,2021 
*/

//prevents the default action
$(document).ready(function(){
	
	$('form').submit(function (evt) {
	   evt.preventDefault(); 

	});
	
	//call the ID of the div class for each form group
	 $("#loanTextError").find(".message").hide();
 	$("#installmentTextError").find(".message").hide();
	$("#interestTextError").find(".message").hide();
	$("#intervalTextError").find(".message").hide();
 	$("#dateTextError").find(".message").hide();
	
//The data that is you submitted it is represented by the input name date
     var date_input=$('input[name="date"]'); 

//DatePicker Should Close Automatically
     var container=$('.repay').length>0 ? $('.repay').parent() : "body";
     var options={
       format: 'mm/dd/yyyy',
       container: container,
       todayHighlight: true,
       autoclose: true,
     };
     date_input.datepicker(options);
	 
	//Round off the  value  of the deciemals when calculating 
	var round=function(value, decimals) {
	   return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	 } ;

	 //Validation of the DatePicker 
	 var weekend = function(day) {
		 if (day.getDay() == 6 || day.getDay() == 0) {
			 return true;
		 } else {
			 return false;
		 }
	 };
	 var addDays = function(date, days) {
	     var result = new Date(date.valueOf());
	     result.setDate(result.getDate() + days);
	     return result;
	 };
	 
	 
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
	 
	 var isValidDate = function(d) {
	   return d instanceof Date && !isNaN(d);
	 };
	 

	 //FUNCTION OF THE BUTTON NAME CALCULATOR
     $("#RunProgram").click(function(){
           
		   // get necessary data from the textbox by the Id of the text box
		 var loan_amount = $("#loanInput").val();
		 var installment_amount = $("#installmentInput").val();
		 var interest_rate = $("#interestInput").val();
		 var start_date = new Date($("#dateInput").val());
		 var installment_interval = $('#intervalInput').find(":selected").text();
		 

		  //When Data is Inputted the Data is being validated 
		 loan_amount = loan_amount.trim();
		 installment_amount = installment_amount.trim();
		 interest_rate = interest_rate.trim();
		 

		 //When Validating it checks the statement if the  statement is true or false  
		 var lv = true;var ia = true;var ir = true;var ii = true;var sd = true;
		 
		
		 //validating Loan Amount
		 if(loan_amount == "" || isFloat(loan_amount) == false || round(loan_amount,2) <= 0.00  || round(loan_amount,2) >= Number.POSITIVE_INFINITY){
			 lv = false;
			 $("#loanTextError").find(".message").show();
		 }
		 else{
			 lv = true;
			 $("#loanTextError").find(".message").hide();
			 
		 }


		 //Validating Installment Amount
		 if( installment_amount == "" || isFloat(installment_amount)== false || round(installment_amount,2) <= 0.00 || round(installment_amount,2) >= round(loan_amount,2) ){
		 	 ia = false;
			$("#installmentTextError").find(".message").show();
		 }else{
			 ia = true;
			 $("#installmentTextError").find(".message").hide();
			 
			 
		 }
		 
		 //Validating Interest Rate
		 if( interest_rate == "" || isFloat(interest_rate) == false  || parseFloat(interest_rate) < 0.00 || parseFloat(interest_rate) >= 100.00 ){
		 	ir =false;
			$("#interestTextError").find(".message").show();
		 }else{
			 ir = true;
			 $("#interestTextError").find(".message").hide();
		 }
		 
		 
		 //Validating  Installment Interval
		 if(installment_interval == "" || (installment_interval  != "Weekly" && installment_interval  != "Daily" && installment_interval  != "Monthly") ){
		 	ii =false;
			$("#intervalTextError").find(".message").show();
		 }else{
			 $("#intervalTextError").find(".message").hide();
			 ii = true;
		 }

		 
		 //Validating the date as which the transaction started
		 if(isValidDate(start_date) == false){
			  sd = false;
		 	$("#dateTextError").find(".message").show();
		 }else{
			 sd = true;
			 $("#dateTextError").find(".message").hide();
		 }
		 

		 //Combination of the Validationg Completed Before Displaying Result
		 if(lv && sd && ii && ia && ir){
			 $("#loanTextError").find(".message").hide();
		 	$("#installmentTextError").find(".message").hide();
			$("#interestTextError").find(".message").hide();
			$("#intervalTextError").find(".message").hide();
		 	$("#dateTextError").find(".message").hide();
		 
		
		 
		  //this where the Calculation and the displaying of the schdule  appears
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
		 var grand = 0.00;
		 var interest_amount = parseFloat(0.00);
		 var principal_interval_amount = parseFloat(0.00);
		 var original_loan_amount = parseFloat(loan_amount);
		 var begin_loan_amount = original_loan_amount;
		 loan_amount = round(loan_amount,2);
		 var current_date = new Date(start_date.getTime());
		 


		 //Formatting the Date Option
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

		 	//Basic Calculation of the interest Rate 
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

				  //Basic Calculation of  the Interest Amount By Month, Weekly and Daily
				 if(installment_interval == "Monthly"){
	   				  interest_amount = round((loan_amount * interest_rate) / 12, 2);
				 } else if(installment_interval == "Weekly"){
					  interest_amount = round((loan_amount * interest_rate) / (12 * 4), 2);
				 } else if(installment_interval == "Daily"){
	   				  interest_amount = round((loan_amount * interest_rate) / (12 * 4 * 7), 2);
				 }
				  
				  
 				 //check when  you add loan and the interest  it will be greater or lesser than the installment amount 
				  if((loan_amount + interest_amount) < installment_amount){
					  installment_amount = loan_amount + interest_amount;
				  }
				  

				  //  the interst amount of the data is  taken out the  installment amount 
				  principal_interval_amount = installment_amount - interest_amount;
				  principal_interval_amount = round(principal_interval_amount,2);


				  //After that is calculate that you take  what is left in the loan amount
				  loan_amount = loan_amount - principal_interval_amount;
				  loan_amount = round(loan_amount,2);
 				 

 				   //quick calculation check to verify everything
				  grand = round(parseFloat(installment_amount) + parseFloat(grand), 2);
			 if(round(interest_amount,2) > round(installment_amount,2) ||  round(principal_interval_amount,2) < 0.00 || !isFloat(begin_loan_amount) || !isFloat(installment_amount) || !isFloat(interest_amount) || !isFloat(principal_interval_amount)){
					  alert("An unexpected error occured, Please check inputs.");
					$("#result").html("");
					return;
				  }
				  
				 
				 
				 
				  //This is where  when ever calculation is check and done the schedule is  displayed
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
				
	
				  duration_counter +=  1;
			 }

			 
		  //This is where  when ever calculation is check and done the schedule grand payment is  shown	 
		  schedulelist += `
				<tr>
				      <th scope="row">Grand Total </th>
		  		      <td><b>`+dateoutput.toLocaleDateString("en-US", options)+`</b></td>
				      <td><b>`+round(original_loan_amount,2)+`</b></td>
		  		      <td><b>`+round(grand,2)+`</b></td>
			 		<td><b>`+round(parseFloat(grand) - parseFloat(original_loan_amount),2)+`</b></td>
		  		      <td><b>`+round(original_loan_amount,2)+`</b></td>
			 	      <td><b>`+round(loan_amount,2)+`</b></td>
				</tr>
				</tbody>
			 	</table>
			 <h3 style="text-align:center;"> $Total is: `+grand+`</h3>
		  `;


		  // Call back the ID in the html  to show the result of the schedule table.
			 $("#result").html(schedulelist);
		 }
		   
		   
       })
	 
  })