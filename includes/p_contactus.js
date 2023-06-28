
/* JS code for the contact us page */

	
/* make some action on the submit button */

document.getElementById('btnsubmit').addEventListener('click', (e) => {
  domail(e);
});



function domail (e='') {
	
	// send the form details
	const s_name = document.querySelector("[name='name']").value;
	const s_email = document.querySelector("[name='email']").value;
	const s_phone = document.querySelector("[name='phone']").value;
	const s_message = document.querySelector("[name='message']").value;

	l(s_name+' + '+s_email+' + '+s_phone+' + '+s_message);
	
	sendcontactform( { "name":s_name, "email":s_email, "phone":s_phone, "message":s_message } );
	
	document.getElementById('contactusform').style.display = "none";
	document.getElementById('contactusmsg').style.display = "block";
			
}




/* send the contact email */

function sendcontactform (params) {
	
	l(params);

	const result = sendMail( '', params )
		.then((data) => {
			
				if (data.response == '0') {
					// ? success message
					l('email sent');
					const msg = 'Your message has been received, and we will contact you soon.';
					document.getElementById('contactusmsg').textContent = msg;
				}
					
				// an error occurred
				//  - get the error message
				data.result.forEach((err)=>{
					l(err);
					document.getElementById('contactusmsg').textContent = err;
				});
			
		});

}

