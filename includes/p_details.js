
/* JS code for the details page */

if (!window.fetch) {
	alert('Sorry, we are unable to display property info because of your browser configuration');
}


/* initial load */
dodisplay();


function dodisplay (e='') {
	
	// property to display is in 'p' param in query string
	//   e.g. http://www.mosswimbledonhill.co.uk/details.html?p=FdA2P2295T2385gpm1C6G5E2340m2475rykN
	
	// get a query string key value
	//    https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	const urlParams = new URLSearchParams(window.location.search);
	const d_propid   = urlParams.get('p');

	l('fetch: '+d_propid);
	
	fetchpropertydata( { "propid":d_propid } );
	fetchpropertyphotos( { "propid":d_propid } );
}



/* display the property details */
//
function loadpropertydata (apidata){
	 
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

	propsobj.properties.forEach((prop)=>{
		l(prop);
		
		// ignore properties not on the market (we should not get here!)
		if (prop.market != 'Y') {
			return;
		}
		
		// add listener to the 'Brochure' button
		document.getElementById('btnbrochure').addEventListener('click', (e) => {
			const link = document.createElement('a');
			link.href = prop.brochure;
			link.download = 'file.pdf';
			link.dispatchEvent(new MouseEvent('click'));
		});


		// display the property headlines in the 'banner' container
		const p_banner = document.getElementById('banner_container');
		
		p_banner.querySelector('.banner_box h6').textContent = ( (prop.beds != '' && prop.beds != '0') ? prop.beds+' Bed ' : '' )+prop.type;
		p_banner.querySelector('.banner_box h1').textContent = prop.address;
		p_banner.querySelector('.banner_box p').textContent  = '£'+(prop.datakey_type=='R'?prop.rentpcm+ ' pcm':prop.price);


		// display the property's details in the results container
		const p_container = document.getElementById('results_container');
		const p_template = p_container.querySelector('.overview_detail');
		
		p_template.querySelector('#property_price label').textContent	= (prop.datakey_type=='R'?'Rent (pcm):':'Price:');
		p_template.querySelector('#property_price h4').textContent	= '£'+(prop.datakey_type=='R'?prop.rentpcm:prop.price);
		
		p_template.querySelector('#property_type h6 span').textContent	= prop.type;
		p_template.querySelector('#property_beds h6 span').textContent	= prop.beds;

		if (typeof prop.dateavail == 'undefined') {
			p_template.querySelector('#property_dateavail h6 span').textContent	= 'now';
		} else {
			const dt = new Date(prop.dateavail);
			const d = dt.getDate();
			const suffix = (31==d||21==d||1==d?"st":22==d||2==d?"nd":23==d||3==d?"rd":"th");
			const month = dt.toLocaleString('default', { month: 'long' });
			p_template.querySelector('#property_dateavail h6 span').textContent	= d+suffix+' '+month;
		}
			
		
		// hide the summary/description if empty
		if (prop.summary == '') {
			p_template.querySelector('#property_summary h2').style.display = 'none';
		} else {
			p_template.querySelector('#property_summary p').innerHTML	= decodeHtml(prop.summary);
		}
		if (prop.description == '') {
			p_template.querySelector('#property_description h2').style.display = 'none';
		} else {
			p_template.querySelector('#property_description p').textContent	= decodeHtml(prop.description);
		}
		
		
		// display the property 'features' (if present)
		if (parseInt(prop.featurescount) > 0) {
			
			const p_feature = p_template.querySelector('#property_features li');
			
			const features = prop.features.split('\n');
			features.forEach((feature) => {
				//l(feature);
				
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = decodeHtml(feature);
				p_feature.parentNode.appendChild(cf);
				
			});
		
			p_feature.style.display = 'none';		// hide the empty template
		
		} else {
			
			// fallback to making up some features  
			const p_feature = p_template.querySelector('#property_features li');
		
			if (prop.beds != '' && prop.beds != '0') { 
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.beds+' Bedroom'+(parseInt(prop.beds)>1?'s':'');
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
			if (prop.baths != '' && prop.baths != '0') {
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.baths+' Bathroom'+(parseInt(prop.baths)>1?'s':'');
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
			if (prop.receptions != '' && prop.receptions != '0') {
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.receptions+' Reception'+(parseInt(prop.receptions)>1?'s':'');
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
			if (prop.heating != '') { 
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.heating;
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
			if (prop.parking != '') { 
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.parking;
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
			if (prop.gdn != '') { 
				const cf = p_feature.cloneNode(true);
				cf.querySelector('img').src = "images/dot.svg";
				cf.querySelector('span').textContent = prop.gdn;
				cf.style.display = '';
				p_feature.parentNode.appendChild(cf);
			}
		
			p_feature.style.display = 'none';		// hide the empty template
			
		}
			
	});	
	
}




/* display the property photos */
//
function loadpropertyphotos (apidata){
	 
	const picsobj = apidata.metadata;

	let basehref = 'https://www.crizoconnect.co.uk/';
	let imagehref = 'https://www.crizoconnect.co.uk/';
		
	// for testing on dev server
	if (window.location.href.match(/mosswimbledonhill.dobbin/)) {
		basehref = 'http://crizo.dobbin/';
		imagehref = 'http://crizo.dobbin/';
	}

	//hide the spinner
	hidespinner();

	// store a clone of the picture swiper slide
	if (typeof window.clones.swiper_slide == 'undefined') {
		let swiper_slide = document.getElementById('results_container').querySelector('.gallery-top').querySelector('.swiper-slide');
		window.clones['swiper_slide_top'] = swiper_slide.cloneNode(true);
		swiper_slide.remove();		// remove the template slide
		//
		swiper_slide = document.getElementById('results_container').querySelector('.gallery-thumbs').querySelector('.swiper-slide');
		window.clones['swiper_slide_thumbs'] = swiper_slide.cloneNode(true);
		swiper_slide.remove();		// remove the template slide
	}

	// for easier processing build an array keyed by pic subtype
	const picsarr = [];
	picsobj.pics.forEach((pic)=>{
		picsarr[pic['subtype']] = pic;
	});
		
	const p_container = document.getElementById('results_container');
	const p_template = p_container.querySelector('.thumbnail_pics');
	
	{ // add pics for swiper
		
		const p_swiper = p_template.querySelector('.gallery-top .swiper-wrapper');
	
		// pics are sorted by subtype, but let's ensure L1 pic is first
		l('L1 - main');
		picsobj.pics.filter((el)=>{ return el.subtype=='L1'; }).forEach((pic)=>{
			const p_img = window.clones['swiper_slide_top'].cloneNode(true);
			p_img.style = "background-image:url('"+imagehref+pic.url +"')";
			p_swiper.appendChild(p_img);
		});
		//
		l('others - main');
		picsobj.pics.filter((el)=>{ return el.subtype!='L1'; }).forEach((pic)=>{
			const p_img = window.clones['swiper_slide_top'].cloneNode(true);
			p_img.style = "background-image:url('"+imagehref+pic.url +"')";
			p_swiper.appendChild(p_img);
		});
		
	}
		
		
	{ // add pics for right block
		
		const p_standalone 	= p_template.querySelector('.merge_pic');
	
		l('L2/3 - right');
		
		let p_merge_pic = p_standalone.firstElementChild;
		p_merge_pic.querySelector('a').href = imagehref+picsarr.L2.url;
		p_merge_pic.querySelector('a img').src = imagehref+picsarr.L2.url;
		p_merge_pic = p_merge_pic.nextElementSibling;
		p_merge_pic.querySelector('a').href = imagehref+picsarr.L3.url;
		p_merge_pic.querySelector('a img').src = imagehref+picsarr.L3.url;

	}
	
	
	{ // gallery-thumbs
		
		const p_gallery = p_template.querySelector('.gallery-thumbs .swiper-wrapper');
	
		picsobj.pics.filter((el)=>{ return el.subtype=='L1'; }).forEach((pic)=>{
			const p_img = window.clones['swiper_slide_top'].cloneNode(true);
			p_img.style = "background-image:url('"+imagehref+pic.url +"')";
			p_gallery.appendChild(p_img);
		});
		//
		picsobj.pics.filter((el)=>{ return el.subtype!='L1'; }).forEach((pic)=>{
			const p_img = window.clones['swiper_slide_thumbs'].cloneNode(true);
			p_img.style = "background-image:url('"+imagehref+pic.url +"')";
			p_gallery.appendChild(p_img);
		});
	
	}
		
	
	{ // activate the slider and gallery
		
		addSwiper();
		addSwiperSlide();
		
	}
	
}



