
/* JS code for the index page */

if (!window.fetch) {
	alert('Sorry, we are unable to display property info because of your browser configuration');
}


/* initial load */
dodisplay();


function dodisplay (e='') {
	
	l('fetch: '+'search');
	
	dosearch();
}



/* display the search results */

function loadsearchresults (apidata){
	 
	const propsobj = apidata.metadata;

	let basehref = 'https://www.crizoconnect.co.uk/';
	let imagehref = 'https://www.crizoconnect.co.uk/';
		
	// for testing on dev server
	if (window.location.href.match(/mosswimbledonhill.dobbin/)) {
		basehref = 'http://crizo.dobbin/';
		imagehref = 'http://crizo.dobbin/';
	}

	// hide the spinner
	hidespinner();
	
	// hide the message block
	clearsearchmsg();

	// store a clone of the property display container
	if (typeof window.clones.result_container == 'undefined') {
		window.clones['result_container'] = document.getElementById('result_container').cloneNode(true);
	}
	
	// clear the previous results
	const res = document.querySelector('#results_container');
	while (res.lastChild) { res.removeChild(res.lastChild); }

	// a counter
	let j = 0;

	// filter the results
	const filtered = propsobj.properties.filter((propobj)=> {

		// ignore properties not on the market
		// use server rules for 'market' [ if (propobj.market != 'Y') { return false; } ]
		
		// ignore 'neighbouring area' properties
		// allow neighbours at present [ if (propobj.neighbour == '1') { return false; } ]
		
		return true;
	});

	
	// filtered propsobj.properties.forEach
	filtered.forEach((prop)=>{
		l(prop);
		
		// add a new result row every 3 properties
		if (!(j++%3)) { 
			d = document.createElement("div");
			d.setAttribute('class','row datarow');
			res.appendChild(d);
		}

		// make a new clone
		const clone = window.clones['result_container'].cloneNode(true);
		clone.style.display = '';

		// make an id for this codeblock
		clone.id 	= 'p_'+prop.propcode;
		
		// default picture if none available
		if (prop.url_pic == '') {
			prop.url_pic = 'MossandCompany/company/581812/NoImagesAvailable.jpeg';
		}
		
		// add property details to search results container
		clone.querySelector('.rcard_pic img').src = imagehref + prop.url_pic;
		clone.querySelector('.rcard_content h3').textContent	= prop.publicaddress;
		clone.querySelector('.content_foot h2 b').textContent	= 'For '+(prop.intent=='R'?'Rent':'Sale')
		clone.querySelector('.content_foot h2 span').textContent	= '£'+(prop.intent=='R'?prop.rentpcm:prop.price);
		
		const url = prop.uri_property.match(/properties\/(.*?)\.json/);
		clone.querySelector('.content_foot #btndetails').addEventListener('click', (e) => { window.location.href='details.html?p='+url[1]; });
		l(prop.uri_property);
		
		const p_features = clone.querySelector('.rcard_content ul');
		const p_feature  = clone.querySelector('.rcard_content ul li');
		let m = 0;
		
		if (prop.beds != '' && prop.beds != '0') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/ico4.svg";
			cf.querySelector('span').textContent = prop.beds+' Bedroom'+(parseInt(prop.beds)>1?'s':'');
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		if (prop.baths != '' && prop.baths != '0') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/ico5.svg";
			cf.querySelector('span').textContent = prop.baths+' Bathroom'+(parseInt(prop.baths)>1?'s':'');
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		if (prop.receptions != '' && prop.receptions != '0') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/ico6.svg";
			cf.querySelector('span').textContent = prop.receptions+' Reception'+(parseInt(prop.receptions)>1?'s':'');
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		if (prop.parking != '' && prop.parking != '0') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/ico7.svg";
			cf.querySelector('span').textContent = lists.opt_parking[prop.parking];
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		//
		// to get the property blocks to line up we need at least 3 'features'
		while (m < 3) {
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";  // 1x1 gif
			cf.querySelector('img').style.background = '#FFF';	// override '.rcard_content li img' css
			cf.querySelector('span').textContent = '';
			cf.style.display = 'inline-block';
			p_features.appendChild(cf);		
			m++;
		}
		p_feature.style.display = 'none';		// hide the empty template

		// add the result item to the result row
		d.appendChild(clone);
		
	});
	
	// have any been displayed?
	if (j == 0) {
		l('no properties displayed');
		dispsearchmsg ("No properties found which match your search criteria.");
	}

	l(clones);
}

