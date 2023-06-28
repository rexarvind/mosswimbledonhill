
/* JS code for the search page */

if (!window.fetch) {
	alert('Sorry, we are unable to display property info because of your browser configuration');
}

// default number of properties per page for search.html is 4
window.pages['props_perpage'] = window.pages['props_search'];


/* initial load */
dodisplay();


function dodisplay (e='') {
	
	l('fetch: '+'search');

	// if there are search params in the url then initiate an appropriate search
	if (location.search.length > 0) {
		
		// implode the url params
		// https://stackoverflow.com/questions/901115/
		const q = {};
		location.search.substr(1).split("&").forEach((item) => {q[item.split("=")[0]] = decodeURIComponent(item.split("=")[1])});
	
		if (q.pg !== undefined && q.pg != '') { window.pages['page_requested'] = q.pg; }
		if (q.pp !== undefined && q.pp != '') { window.pages['props_perpage']  = q.pp; }
		
		if (q.f != null && q.a != null && q.b != null && q.pr != null && q.pb != null) {
			fetchsearchresults( { "intent":q.f, "area":q.a, "beds":q.b, "rentmax":q.pr, "buymax":q.pb,
														"page":window.pages.page_requested, "perpage":window.pages.props_perpage } );
			return;
		}
		
		// strip the search string from the browser url
		window.history.pushState({}, document.title, window.location.pathname);
	}
	
	// else just do a regular property fetch
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
		//imagehref = 'https://www.crizoconnect.co.uk/';
		imagehref = 'http://crizo.dobbin/';
	} else {
	}

	//hide the spinner
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
		
		// add a new result row every 2 properties
		if (!(j++%2)) { 
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
		clone.querySelector('.srcard_pic img').src = imagehref + prop.url_pic;
			
		clone.querySelector('.srcard_content h3').textContent	= prop.publicaddress;
		clone.querySelector('.srcard_content p').textContent	= prop.summary;
		clone.querySelector('.textforrent h2 section').textContent	= '£'+(prop.intent=='R'?prop.rentpcm:prop.price)+' '+prop.rentperiod;   
		clone.querySelector('.textforrent h2 section').style.textTransform='none';
		clone.querySelector('.textforrent h2 span').textContent	= 'For '+(prop.intent=='R'?'Rent':'Sale');
		
		const url = prop.uri_property.match(/properties\/(.*?)\.json/);
		clone.querySelector('.search_foot #btndetails').addEventListener('click', (e) => { window.location.href='details.html?p='+url[1]; });
		l(prop.uri_property);
		clone.querySelector('.search_foot #btnviewing').addEventListener('click', (e) => { alert('coming soon...'); });
		clone.querySelector('.search_foot #btnoffer').addEventListener('click', (e) => { alert('coming soon...'); });
		
		
		// add the property features
		const p_features = clone.querySelector('.srcard_content ul');
		const p_feature  = clone.querySelector('.srcard_content ul li');
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
		if (prop.heating != '') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/icon21.svg";
			cf.querySelector('span').textContent = lists.opt_heating[prop.heating];
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		if (prop.parking != '') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/icon22.svg";
			cf.querySelector('span').textContent = lists.opt_parking[parseInt(prop.parking)];
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		if (prop.propcode != '') { 
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "images/icon23.svg";
			cf.querySelector('span').textContent = prop.propcode;
			cf.style.display = '';
			p_features.appendChild(cf);
			m++;
		}
		//
		// to get the property blocks to line up we need at least 4 'features'
		while (m < 4) {
			const cf = p_feature.cloneNode(true);
			cf.querySelector('img').src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";  // 1x1 gif
			cf.querySelector('img').style.background = '#FFF';	// override '.srcard_content li img' css
			cf.querySelector('span').textContent = '';
			cf.style.display = 'inline-block';
			p_features.appendChild(cf);		
			m++;
		}
		p_feature.style.display = 'none';		// hide the empty template

		// add the result item to the result row
		d.appendChild(clone);
		
		
		// fetch the property photos
		//const url = prop.uri_property.match(/properties\/(.*?)\.json/);
		const d_propid = url[1];
		l('photos: '+d_propid);
		fetchpropertyphotos( { "propid":d_propid } );
		
	});
	
	// have any been displayed?
	if (j == 0) {
		l('no properties displayed');
		dispsearchmsg ("No properties found which match your search criteria.");
	}
	
	// display the page buttons
	disppagination(apidata);
	
}



/* display the property photos */

function loadpropertyphotos (apidata){
	 
	const picsobj = apidata.metadata;

	let basehref = 'https://www.crizoconnect.co.uk/';
	let imagehref = 'https://www.crizoconnect.co.uk/';
		
	// for testing on dev server
	if (window.location.href.match(/mosswimbledonhill.dobbin/)) {
		basehref = 'http://crizo.dobbin/';
		imagehref = 'http://crizo.dobbin/';
	}

	// store a clone of the picture swiper slide
	if (typeof window.clones.swiper_slide == 'undefined') {
		window.clones['swiper_slide'] = window.clones['result_container'].querySelector('.swiper-slide').cloneNode(true);
	}
		
	// get the results container
	const p_container = document.getElementById('results_container');
	
	{ // add pics for swiper
		
		// a counter of num of pics displayed
		let j = 0;
	
		// pics are sorted by subtype, but let's ensure L1 pic is first
		//l('L1 - main');
		picsobj.pics.filter((el)=>{ return el.subtype=='L1'; }).forEach((pic)=>{
			if (pic.url == '') { return; }
			j++;
			
			// find this property within the results
			//   one slide node will already exist (from default html)
			const p_id 	= 'p_'+pic.propcode;
			const p_prop_container = p_container.querySelector('#'+p_id );
			const p_swiper = p_prop_container.querySelector('.swiper-slide');
			const p_img = p_swiper;
			p_img.querySelector('img').src = imagehref + pic.url;
		});
		
		// now add up to 3 of the other pics
		//l('others - main');
		picsobj.pics.filter((el)=>{ return el.subtype!='L1'; }).forEach((pic)=>{
			if (pic.url == '') { return; }
			j++;
			
			// only display 4 pics max (to avoid heavy downloads)
			if (j > 4) { return; }

			// find this property within the results
			//   add a new slide node
			const p_id 	= 'p_'+pic.propcode;
			const p_prop_container = p_container.querySelector('#'+p_id );
			const p_swiper = p_prop_container.querySelector('.swiper-slide');
			const p_pic_container = p_swiper.parentNode;
			const p_img = window.clones['swiper_slide'].cloneNode(true);
			p_img.querySelector('img').src = imagehref + pic.url;
			p_pic_container.appendChild(p_img);
		});
		
		if (j > 0) {
			// hide the original photo loaded by loadsearchresults()
			//p_swiper.style.display = 'none';
		}
		
	}

		
	
	{ // activate the slider and gallery

		addSwiper();
		
	}

}
