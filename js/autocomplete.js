/*
JavaScript Auto-Complete script
Author: Guyon Roche
URL: http://www.webreference.com/programming/javascript/gr/column5/3.html

Minor mods by PHP-4-Business 2010

*/

function AutoCompleteDB()
{
	// set the initial values.
	this.bEnd = false;
	this.nCount = 0;
	this.aStr = new Object;
}

AutoCompleteDB.prototype.add = function(str)
{
	// increment the count value.
	this.nCount++;

	// if at the end of the string, flag this node as an end point.
	if ( str == "" )
		this.bEnd = true;
	else
	{
		// otherwise, pull the first letter off the string
		var letter = str.substring(0,1);
		var rest = str.substring(1,str.length);

		// and either create a child node for it or reuse an old one.
		if ( !this.aStr[letter] ) this.aStr[letter] = new AutoCompleteDB();
		this.aStr[letter].add(rest);
	}
}

AutoCompleteDB.prototype.getCount = function(str, bExact)
{
	// if end of search string, return number
	if ( str == "" )
		if ( this.bEnd && bExact && (this.nCount == 1) ) return 0;
		else return this.nCount;

	// otherwise, pull the first letter off the string
	var letter = str.substring(0,1);
	var rest = str.substring(1,str.length);

	// and look for case-insensitive matches
	var nCount = 0;
	var lLetter = letter.toLowerCase();
	if ( this.aStr[lLetter] )
		nCount += this.aStr[lLetter].getCount(rest, bExact && (letter == lLetter));

	var uLetter = letter.toUpperCase();
	if ( this.aStr[uLetter] )
		nCount += this.aStr[uLetter].getCount(rest, bExact && (letter == uLetter));

	return nCount;
}

AutoCompleteDB.prototype.getStrings = function(str1, str2, outStr)
{
	if ( str1 == "" )
	{
		// add matching strings to the array
		if ( this.bEnd )
			outStr.push(str2);

		// get strings for each child node
		for ( var i in this.aStr )
			this.aStr[i].getStrings(str1, str2 + i, outStr);
	}
	else
	{
		// pull the first letter off the string
		var letter = str1.substring(0,1);
		var rest = str1.substring(1,str1.length);

		// and get the case-insensitive matches.
		var lLetter = letter.toLowerCase();
		if ( this.aStr[lLetter] )
			this.aStr[lLetter].getStrings(rest, str2 + lLetter, outStr);

		// was failing when string contains " " or digit since it was matching BOTH lower & upper case
		// and thence matching twice (note: we do need to run BOTH lower & upper case letters depending on the dataset)
		var myRegxp = /[a-zA-Z]+/;
		if( myRegxp.test(letter) == true ) {
			var uLetter = letter.toUpperCase();
			if ( this.aStr[uLetter] )
				this.aStr[uLetter].getStrings(rest, str2 + uLetter, outStr);
		}
	}
}

function AutoComplete(aStr, oText, oDiv, nMaxSize, nOffsetX, nOffsetY, cBackground, cHighlight)
{
	if ((typeof cBackground == 'undefined') || (typeof cBackground === null)) { cBackground = 'AutoCompleteBackground'; }
	if ((typeof cHighlight == 'undefined') || (typeof cHighlight === null )) { cHighlight = 'AutoCompleteHighlight'; }

	// initialize member variables
	this.oText				= oText;
	this.oDiv 				= oDiv;
	this.nMaxSize 		= nMaxSize;
	this.nOffsetX 		= nOffsetX;
	this.nOffsetY 		= nOffsetY;
	this.cBackground 	= cBackground;
	this.cHighlight 	= cHighlight;

	// preprocess the texts for fast access
	this.db = new AutoCompleteDB();
	var i, n = aStr.length;
	for ( i = 0; i < n; i++ )
	{
		this.db.add(String(aStr[i]));
	}

	// attach handlers to the text-box
	oText.AutoComplete = this;
	oText.onkeyup = function(){ this.AutoComplete.onchange(); }
	oText.onblur = function(){ this.AutoComplete.onblur(); }
}

AutoComplete.prototype.onblur = function()
{
	//this.oDiv.style.visibility = "hidden";
	this.oDiv.style.display = "none";
}

AutoComplete.prototype.onDivMouseDown = function()
{
	this.AutoComplete.oText.value = this.innerHTML;
	this.AutoComplete.onblur();
	this.AutoComplete.oText.focus();									// only FF seems to work without a delay...
	that = this; setTimeout(function(){ that.AutoComplete.oText.focus(); }, 300);

}

AutoComplete.prototype.onDivMouseOver = function()
{
	//this.className = "AutoCompleteHighlight";
	this.className = this.AutoComplete.cHighlight;
}

AutoComplete.prototype.onDivMouseOut = function()
{
	//this.className = "AutoCompleteBackground";
	this.className = this.AutoComplete.cBackground;
}

AutoComplete.prototype.onchange = function()
{
	var txt = this.oText.value;

	// count the number of strings that match the text-box value
	var nCount = this.db.getCount(txt, true);

	// if a suitable number then show the popup-div
	if ( (this.nMaxSize == -1 ) || ((nCount < this.nMaxSize) && (nCount > 0)) )
	{
		// clear the popup-div.
		while ( this.oDiv.hasChildNodes() )
			this.oDiv.removeChild(this.oDiv.firstChild);

		// get all the matching strings from the AutoCompleteDB
		var aStr = new Array();
		this.db.getStrings(txt, "", aStr);

		// add each string to the popup-div
		var i, n = aStr.length;
		for ( i = 0; i < n; i++ )
		{
			var oDiv = document.createElement('div');
			this.oDiv.appendChild(oDiv);
			//oDiv.className = "AutoCompleteBackground";
			oDiv.className = this.cBackground;
			oDiv.innerHTML = aStr[i];
			oDiv.onmousedown = AutoComplete.prototype.onDivMouseDown;
			oDiv.onmouseover = AutoComplete.prototype.onDivMouseOver;
			oDiv.onmouseout = AutoComplete.prototype.onDivMouseOut;
			oDiv.AutoComplete = this;
		}
		//this.oDiv.style.visibility = "visible";
		this.oDiv.style.display = "block";

		if (typeof(this.oDiv.style.posLeft) != 'undefined' && this.oDiv.style.posLeft != 'NaN') {// IE
	    this.oDiv.style.posLeft = this.oText.style.posLeft + this.nOffsetX;
	    this.oDiv.style.posTop  = this.oText.style.posTop + this.nOffsetY;
	    this.oDiv.style.posWidth= this.oText.style.posWidth;
		} else {
	    this.oDiv.style.left 		= (parseInt(this.oText.style.left) || 0) + this.nOffsetX + 'px';
	    this.oDiv.style.top  		= (parseInt(this.oText.style.top) || 0) + this.nOffsetY + 'px';
	    this.oDiv.style.width   = this.oText.style.width;
		}
	}
	else // hide the popup-div
	{
		this.oDiv.innerHTML = "";
		//this.oDiv.style.visibility = "hidden";
		this.oDiv.style.display = "none";
	}
}
