// Custom Select Menu

// don't initialise 'select' overlay until the values have been fetched from server
function addSelectOverlay() {          

			// Custom Select Menu
			//    Created by Wallace Erick, September 17, 2013
			//      https://codepen.io/wallaceerick
			//    Comments by Janaki
			//			https://codeamend.com/blog/how-to-style-the-option-of-an-html-select-element/

			$('select').each(function(){
				
					// Cache the number of options
					var $this = $(this), numberOfOptions = $(this).children('option').length;
				
				
					// Hides the select element
					$this.addClass('select-hidden'); 
					
					// Wrap the select element in a div
					$this.wrap('<div class="select"></div>');
					
					// Insert a styled div to sit over the top of the hidden select element
					$this.after('<div class="select-styled"></div>');


					// Cache the styled div
					var $styledSelect = $this.next('div.select-styled');
					
					// Show the first select option in the styled div
					$styledSelect.text($this.children('option').eq(0).text());
				
				
					// Insert an unordered list after the styled div and also cache the list
					var $list = $('<ul />', {
							'class': 'select-options'
					}).insertAfter($styledSelect);
				
				
					// Insert a list item into the unordered list for each select option
					for (var i = 0; i < numberOfOptions; i++) {
							$('<li />', {
									text: $this.children('option').eq(i).text(),
									rel: $this.children('option').eq(i).val()
							}).appendTo($list);
					}
				
					// Cache the list items
					var $listItems = $list.children('li');
				
					// Show the unordered list when the styled div is clicked (also hides it if the div is clicked again)
					$styledSelect.click(function(e) {
							e.stopPropagation();
							$('div.select-styled.active').not(this).each(function(){
									$(this).removeClass('active').next('ul.select-options').hide();
							});
							$(this).toggleClass('active').next('ul.select-options').toggle();
					});
				
					// Hides the unordered list when a list item is clicked and updates the styled div to show the selected list item
					// Updates the select element to have the value of the equivalent option (note: option is not 'selected')
					$listItems.click(function(e) {
							e.stopPropagation();
							$styledSelect.text($(this).text()).removeClass('active');
							$this.val($(this).attr('rel'));
							$list.hide();
					});
				
					// Hides the unordered list when clicking outside of it
					$(document).click(function() {
							$styledSelect.removeClass('active');
							$list.hide();
					});

			});
			
}
