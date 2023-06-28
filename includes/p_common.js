

/*---------------------------------------------------------------------------------------------------*/
/* Declare Global objects ---------------------------------------------------------------------------*/

// object to hold data lists retrieved from server
window.lists = new Object();

// object to hold DOM clones
window.clones = new Object();

// object to hold pagination data
window.pages = new Object( { 'page_requested':'1', 'props_perpage':'999', 'props_search':'4' });

// enable/disable console.log output
window.logenabled = true;

// log the url
l(window.location.href);

// does page have the search form?
window.hassearch = ( document.getElementById('searchform') !== null ? true : false );
l(window.hassearch);




/*---------------------------------------------------------------------------------------------------*/
/* Fetch the lists of constants from the server -----------------------------------------------------*/

fetchData ( 'lists', {} )
	.then((data) => {
			if (data.response == 0) {
				lists = data.metadata.data;
			} else {
				lists = {};
			}
			//l(lists);
			loadlists(lists);
			
			if (window.hassearch) {
				
				// update the search boxes with the url search string
				if (typeof getsearchparams === "function") {
					getsearchparams();
				}	
				
				// clear the 'Area' default value
				if (typeof clearareaplaceholder === "function") {
					clearareaplaceholder();
				}	
				
				// load the 'area' autocomplete
				if (typeof createAutoCompleteSearch === "function") {
					createAutoCompleteSearch();
				}	
				
			}

	});


// load the server lists into the search form (bedrooms/rent-max,buy-max)
//
function loadlists (listsobj){

	if (document.getElementById('searchform') != null) {
				
			const res = document.querySelector('.salerent_form');

			// beds - create 'select.options' list from lists.opt_bed
			//
			if ( Object.keys(listsobj.opt_beds).length > 0 ) {
			
				const beds_select = document.getElementById('Bedrooms');
				
				listsobj.opt_beds.forEach((opt_bed)=>{
					const opt = document.createElement("option");
					opt.value = opt_bed;
					opt.text  = opt_bed;
					beds_select.add(opt, null);
				});
				
			}
			
			
			// price - create 'select.options' list from lists.opt_opt_rentrange and opt_buyrange
			//         there are two lists: one for max-rent and one for max-buy
			//
			if ( Object.keys(listsobj.opt_rentrange).length > 0 ) {
			
				const price_select = document.getElementById('Price-Rent');
				
				for (let i = parseInt(listsobj.opt_rentrange.min); i <= parseInt(listsobj.opt_rentrange.max); i=i+parseInt(listsobj.opt_rentrange.step)) {
					const opt = document.createElement("option");
					opt.value = i;
					opt.text  = i;
					price_select.add(opt, null);
				};
				
			}
			//
			if ( Object.keys(listsobj.opt_buyrange).length > 0 ) {
			
				const price_select = document.getElementById('Price-Buy');
				
				Object.entries(listsobj.opt_buyrange).forEach(([k, v]) => {
					//l(k+' = '+v);
					v = v.replace('&pound;','');
					const opt = document.createElement("option");
					opt.value = k;
					opt.text  = v;
					price_select.add(opt, null);
				});
				
			}
			//
			//display one of max-rent/max-buy according to which radio button is checked
			//
			const buy_or_rent = document.querySelector('input[name="intent"]:checked').value;
			if ( buy_or_rent == 'B' ) {
				document.getElementById('intent_rent_price').style.display = 'none';
				document.getElementById('intent_buy_price').style.display = 'inline';
			} else {
				document.getElementById('intent_rent_price').style.display = 'inline';
				document.getElementById('intent_buy_price').style.display = 'none';
			}
			
			
			// add custom select menu overlay 
			//   - this must be deferred until after we have loaded the API values above
			//
			if (typeof addSelectOverlay === "function") {
				addSelectOverlay();
			}	
			
			
			// switch list if user changes the Buy/Rent radio
			//
			document.getElementById('intent_buy').addEventListener('change', (e) => { l('buy');
				document.getElementById('intent_rent_price').style.display = 'none';
				document.getElementById('intent_buy_price').style.display = 'inline';
			});
			document.getElementById('intent_rent').addEventListener('change', (e) => { l('rent');
				document.getElementById('intent_rent_price').style.display = 'inline';
				document.getElementById('intent_buy_price').style.display = 'none';
			});
			
			
			
			// area - create array of Area names lists.opt_town
			if ( Object.keys(listsobj.opt_town).length > 0 ) {
			
				listsobj.area_names = [];

				listsobj.opt_town.forEach((_opt_town)=>{
					listsobj.area_names.push( ucwords(_opt_town) );
				});
				
			}
			
	}
	
}



/*---------------------------------------------------------------------------------------------------*/
/* Fetch the URL params -----------------------------------------------------------------------------*/

/* load any search params from the url */
//
function getsearchparams () {

	if (location.search.length > 0) {

		// implode the url params
		// https://stackoverflow.com/questions/901115/
		const q = {};
		location.search.substr(1).split("&").forEach((item) => {q[item.split("=")[0]] = decodeURIComponent(item.split("=")[1])});
		//l(q);

		// set the values in the search form from the url param string
		//
		// also set the custom styled fields
		//
		// f = R rent or B buy; a = Area; b = Bedrooms; pr = Max Price Rent; pb = Max Price Buy
		// e.g. ?f=R&a=FulhamCroydon&b=1&pr=5&pb=
		//			?f=B&a=Croydon&b=3&pr=&pb=2
		//
		if (q.f !== undefined && q.f != '') {
			const el = (q.f=='B'?'intent_buy':q.f=='R'?'intent_rent':'');
			if (el != '') {
				document.getElementById(el).checked = 'checked';
			}
			// display appropriate price list
			document.getElementById(el).dispatchEvent(new Event('change'));
		}
		if (q.a !== undefined && q.a != '') {
			document.getElementById('Area').value = q.a;
		}
		if (q.b !== undefined && q.b != '') {
			document.getElementById('Bedrooms').value = q.b;
			document.getElementById('Bedrooms').parentNode.querySelector('.select-styled').textContent = document.getElementById('Bedrooms').options[q.b].text;
		}
		if (q.pr !== undefined && q.pr != '') {
			document.getElementById('Price-Rent').value = q.pr;
			document.getElementById('Price-Rent').parentNode.querySelector('.select-styled').textContent = document.getElementById('Price-Rent').options[q.pr].text;
		}
		if (q.pb !== undefined && q.pb != '') {
			document.getElementById('Price-Buy').value = q.pb;
			document.getElementById('Price-Buy').parentNode.querySelector('.select-styled').textContent = document.getElementById('Price-Buy').options[q.pb].text;
		}
		
		// get the paging params
		//
		// pg = page number; pp = per page
		//
		if (q.pg !== undefined && q.pg != '') {
			window.pages['page_requested'] = q.pg;
		}
		if (q.pp !== undefined && q.pp != '') {
			window.pages['props_perpage'] = q.pp;
		}
		
		// strip the search string from the browser url
		window.history.pushState({}, document.title, window.location.pathname);
		
	}
	
}




/* display the 'page' buttons */
//
function disppagination (apidata) {
	
	const pageobj = apidata.metadata;
	const thispage = +pageobj.thispage;
	const maxp = Math.ceil( +pageobj.counttotal / +pageobj.perpage );
	
	l('this page: '+thispage);
	l('max page: '+maxp);
	
	// delete existing event listeners
	// clone the element and replace the element with its clone. Events are not cloned.
	// 		Attribute event handlers(e.g. onclick="..." ARE cloned.
	const el = document.querySelector('.pagination');
	el.style.display = (maxp == 1 ? "none" : "");
	if (maxp == 1) return;
	el.replaceWith(el.cloneNode(true));
	
	// add new event listeners on buttons
	//   (uses discrete block-scoped 'lets' to avoid needing closures)
	let p = 0;
	p = ( thispage - 1 < 1 ? maxp : thispage - 1 );
	let pp=p; document.getElementById('page_item_p').addEventListener('click', (e) => { dosearchpage(e, pp); });
	//l('p= '+pp);
	
	p = ( thispage + 1 > maxp ? 1 : thispage + 1 );
	let pn=p; document.getElementById('page_item_n').addEventListener('click', (e) => { dosearchpage(e, pn); });
	//l('n= '+pn);
	
	p = ( thispage == 1 ? thispage : thispage == maxp && maxp > 2 ? thispage - 2 : thispage - 1 );
	let p1=p; document.getElementById('page_item_1').addEventListener('click', (e) => { dosearchpage(e, p1); });
	document.getElementById('page_item_1').querySelector('a').textContent = p;
	//l('1= '+p1);
	
	p = ( thispage == 1 ? thispage + 1 : thispage == maxp && maxp > 2 ? thispage - 1 : thispage );
	let p2=p; document.getElementById('page_item_2').addEventListener('click', (e) => { dosearchpage(e, p2); });
	document.getElementById('page_item_2').querySelector('a').textContent = p;
	//l('2= '+p2);
	
	p = ( thispage == 1 ? thispage + 2 : thispage == maxp && maxp > 2 ? thispage : thispage + 1 );
	let p3=p; document.getElementById('page_item_3').addEventListener('click', (e) => { dosearchpage(e, p3); });
	document.getElementById('page_item_3').querySelector('a').textContent = p;
	if (p > maxp) { document.getElementById('page_item_3').style.display="none"; }
					 else { document.getElementById('page_item_3').style.display="inline"; }
	//l('3= '+p3);
	
}


/* hide the 'page' buttons */
//
function hidepagination () {
	
	document.querySelector('.pagination').style.display = 'none';
	
}



/* tidy the existingresults & then run new search */
//
function dosearchpage (e, p) {
	l('request page: '+p);
	
	// show the spinner
	dispspinner();
	
	// hide the message block
	clearsearchmsg();
	
	// clear existing results 
	Array.from(document.getElementsByClassName('datarow')).forEach((r) => {
		r.parentNode.removeChild(r);
	});
	
	// set page requested
	window.pages.page_requested = p;
	
	dosearch(e);
}	
	
	
	


/*---------------------------------------------------------------------------------------------------*/
/* Handle the Search box ----------------------------------------------------------------------------*/

/* make some action on the submit button */
//
if (document.getElementById('btnsearch') != null) {
	
	// display page 1 of the results
	
	document.getElementById('btnsearch').addEventListener('click', (e) => {
		dosearchpage(e, 1);
	});
	
}


/* action the search */
//
function dosearch (e='') {
	
	// note addSelectOverlay->$listItems.click() sets object.value and does not set 'el.options[el.selectedIndex]'
	//    hence "el.value;" and not "el.options[el.selectedIndex].value;"
	//      also note this is not the HTML 'value=""' attribute, but the 'value' property from the DOM
	//
	const s_intent = document.querySelector('input[name="intent"]:checked').value;
	const s_area = document.getElementById('Area').value;
	const s_beds = document.getElementById('Bedrooms').value;
	const s_price_rent = document.getElementById('Price-Rent').value;
	const s_price_buy = document.getElementById('Price-Buy').value;

	l('fetch: '+s_intent+' + '+s_area+' + '+s_beds+' + '+s_price_rent+' + '+s_price_buy); l(window.pages);
	
	if (typeof e.srcElement == 'object') {
		
		// 'search' button pushed
		// according to the design: all searches go to the search.html page
		//
		if (window.location.href.match(/search.html/)) {
			fetchsearchresults( { "intent":s_intent, "area":s_area, "beds":s_beds, "rentmax":s_price_rent, "buymax":s_price_buy,
														"page":window.pages.page_requested, "perpage":window.pages.props_perpage } );
		} else {
			const params = { 'f':s_intent, 'a':s_area, 'b':s_beds, 'pr':s_price_rent, 'pb':s_price_buy,
											 'pg':window.pages.page_requested, 'pp':window.pages.props_search };
			
			const queryString = Object.entries(params).map(([k, v]) => {
				return encodeURIComponent(k)+'='+encodeURIComponent(v);
			}).join('&');
			
			const url = 'search.html?'+queryString;
			l('chain to: '+url);
			window.location.href = url;
		}
	}
	else
	{
		// not a button push - just fetch the search results (i.e. initial load)
			fetchsearchresults( { "intent":s_intent, "area":s_area, "beds":s_beds, "rentmax":s_price_rent, "buymax":s_price_buy,
														"page":window.pages.page_requested, "perpage":window.pages.props_perpage } );
	}
}


/* fetch the search results */
//
function fetchsearchresults (params) {
	
	// params are { "intent", "area", "beds", "rentmax", "buymax", "page", "perpage" }
	
	l(params);

	fetchData( 'search', params )
		.then((data) => {
			
				if (data.response == '0') {
					loadsearchresults(data);
					return;
				}
					
				// an error occurred
				//  - get the error message

				data.result.forEach((err)=>{
					l(err);
					if (err.text.includes("No properties found")) {
						l('no properties displayed');
						dispsearchmsg ("No properties found which match your search criteria.");
						/*
						{
							"img": "<img src='https://www.crizo.dobbin/common/images/errors/red_cross.gif'>",
							"text": "No properties found which meet your criteria. Please try again."
						}
						*/
						// hide the spinner
						hidespinner();
						// hide the page buttons
						hidepagination();
					}
				});
			
		});

}


/* fetch the property */
//
function fetchpropertydata (params) {					
	
	// params are { "propid" }
	
	l(params);

	fetchData( 'property', params )
		.then((data) => {
			
				if (data.status == 'ERROR') {													// ??????????????????????????????????????
					l(data.info);
					return;
				}
					
				if (data.response == '0') {
					loadpropertydata(data);
					return;
				}
					
				// an error occurred
				//  - get the error message
				data.result.forEach((err)=>{
					l(err);
					if (err.text.includes("????")) {
						
						// report error SOMEWHERE???????????????????????????
						
					}
				});
			
		});

}


/* fetch the property photos */
//
function fetchpropertyphotos (params) {				
	
	// params are { "propid":d_propid }
	
	l(params);

	fetchData( 'photos', params )
		.then((data) => {
			
				if (data.status == 'ERROR') {													// ??????????????????????????????????????
					l(data.info);
					return;
				}
					
				if (data.response == '0') {
					loadpropertyphotos(data);
					return;
				}
					
				// an error occurred
				//  - get the error message
				data.result.forEach((err)=>{
					l(err);
					if (err.text.includes("????")) {
						
						// report error SOMEWHERE???????????????????????????
						
					}
				});
			
		});

}




/* clear the default value (so user doesn't have to) */
//
function clearareaplaceholder () {
	document.getElementById('Area').addEventListener('mousedown', function clearplaceholder(e) { 
		e.target.value = '';
    e.target.removeEventListener("mousedown", clearplaceholder, false);
	});
}


/* custom autocomplete box using area names retrieved from api */
//
function createAutoCompleteSearch() {
			
		const nMaxSize = 25;
		const nOffsetX = 30;
		const nOffsetY = 73;
		const nFontSize = 10;

		new AutoComplete(window.lists.area_names, document.getElementById('Area'), document.getElementById('AreaDiv'), nMaxSize, nOffsetX, nOffsetY, 'AutoCompleteBackgroundSearch', 'AutoCompleteHighlightSearch');
};


/* capitalise first letter of each word */
//
function ucwords(str) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}


/* display error message */
//
function dispsearchmsg (msg) {
	
		const m = document.getElementById('results_message');
		m.textContent = msg;
		m.style.display = "block";
		
}


/* clear error message */
//
function clearsearchmsg () {
	
		const m = document.getElementById('results_message');
		m.textContent = '';
		m.style.display = "none";
		
}


/* display spinner */
//
function dispspinner () {
		
		document.getElementById('results_spinner').style.display = '';
		
}


/* clear error message */
//
function hidespinner () {
		
		document.getElementById('results_spinner').style.display = 'none';
		
}
		
