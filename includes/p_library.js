
/* JS code to fetch the common 'lists' from the API */

if (!window.fetch) {
	alert('Sorry, we are unable to send your request because of your browser configuration');
}


/*-------------------*/
/* library functions */

const session_id = Math.random().toString(36).slice(-7)+Math.random().toString(36).slice(-7);
		
// call local PHP server which interfaces to the API
//
async function fetchData (uri='', data={}) {
	if (!window.fetch) { return ''; }
	
  try {
		const formBody = Object.entries(data).map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)).join('&')
    const r = await fetch('php/getapi.php?'+uri, {
									method: "POST",
									mode: "cors",
									cache: "no-cache",
									credentials: "same-origin",
									headers: {
											"Content-Type": "application/x-www-form-urlencoded",
											"X-Session-id": session_id
									},
									redirect: "follow",
									referrerPolicy: "no-referrer",
									body: formBody
								});
			if (!r.ok) throw new Error(r.statusText);  // http status 200-299
			l(r);

    const body = await r.json();
			l(body);
			// handle the error in the caller  //if (!body.response == 0) throw new Error(body.response);  // api reports error
			return body;

  } catch (error) {
			console.error(error);
  }
}



// call local PHP server to send email
//
async function sendMail (uri='', data={}) {
	if (!window.fetch) { return ''; }
	
  try {
		const formBody = Object.entries(data).map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)).join('&')
    const r = await fetch('php/putmail.php?'+uri, {
									method: "POST",
									mode: "cors",
									cache: "no-cache",
									credentials: "same-origin",
									headers: {
											"Content-Type": "application/x-www-form-urlencoded",
											"X-Session-id": session_id
									},
									redirect: "follow",
									referrerPolicy: "no-referrer",
									body: formBody
								});
			if (!r.ok) throw new Error(r.statusText);
			l(r);

    const body = await r.json();
			l(body);
			// handle the error in the caller  //if (!body.response == 0) throw new Error(body.response);  // api reports error
			return body;

  } catch (error) {
			console.error(error);
  }
}



// decode htmlentities
//   https://stackoverflow.com/questions/7394748/
//
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}



// logger
//
function l(m) {
    if (window.logenabled) {
			console.log(m);
		}
}

