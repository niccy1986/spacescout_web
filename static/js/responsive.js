/* Normalized hide address bar for iOS & Android (c) Scott Jehl, scottjehl.com MIT License */

/*(function(a){var b=a.document;if(!location.hash&&a.addEventListener){window.scrollTo(0,1);var c=1,d=function(){return a.pageYOffset||b.compatMode==="CSS1Compat"&&b.documentElement.scrollTop||b.body.scrollTop||0},e=setInterval(function(){if(b.body){clearInterval(e);c=d();a.scrollTo(0,c===1?0:1)}},15);a.addEventListener("load",function(){setTimeout(function(){if(d()<20){a.scrollTo(0,c===1?0:1)}},0)})}})(this);

/*! A fix for the iOS orientationchange zoom bug. Script by @scottjehl, rebound by @wilto.MIT License.*/
/*(function(m){var l=m.document;if(!l.querySelector){return}var n=l.querySelector("meta[name=viewport]"),a=n&&n.getAttribute("content"),k=a+",maximum-scale=1",d=a+",maximum-scale=10",g=true,j,i,h,c;if(!n){return}function f(){n.setAttribute("content",d);g=true}function b(){n.setAttribute("content",k);g=false}function e(o){c=o.accelerationIncludingGravity;j=Math.abs(c.x);i=Math.abs(c.y);h=Math.abs(c.z);if(!m.orientation&&(j>7||((h>6&&i<8||h<8&&i>6)&&j>5))){if(g){b()}}else{if(!g){f()}}}m.addEventListener("orientationchange",f,false);m.addEventListener("devicemotion",e,false)})(this); */

(function(w){
	var sw = document.body.clientWidth,
		breakpoint = 767,
		speed = 600,
		mobile = true;

	$(document).ready(function() {

		checkMobile();

		// Toggle Filter display
		$('#filter_button').click(function() {
    		if ($("#filter_block").is(":hidden")) {

                $("#filter_block").slideDown(speed, function() {
                    // Animation complete.
                    if (mobile) {
                        $('#map_canvas').hide();
                        $('#info_list').hide();
                        $('.back-top').hide();
                    }
                });

            } else {
                // scroll to top of the page and then slide the filters up
                scrollTo('top');
                $("#filter_block").slideUp(speed);

                if (mobile) {
                    $('#map_canvas').show();
                    $('#info_list').show();
                    $('#filter_button_container').show();
                    $('.back-top').show();

                }

            }
        });

        // Close the filter display using Cancel button
        $('#cancel_results_button').click(function() {

            scrollTo('top');
            $("#filter_block").slideUp(speed);

            if (mobile) {
                $('#map_canvas').show();
                $('#info_list').show();
                $('#filter_button_container').show();
                $('.back-top').show();
            }

        });

        // Space descriptions
        if (mobile){
            // Handle space description popover
            $('#view_space_descriptions').popover({
                title: 'Space Descriptions',
                content: 'Some content!',
                placement: 'bottom',
                html: true,
                content: function() {
                  return $('#space_descriptions_list').html();
                }
            });
        }
        else {
            // Handle space description popover
            $('#view_space_descriptions').popover({
                title: 'Space Descriptions',
                content: 'Some content!',
                placement: 'right',
                html: true,
                content: function() {
                  return $('#space_descriptions_list').html();
                }
            });
        }


        $('#close_descriptions').live('click', function(){
            $('#view_space_descriptions').popover('hide');
            return false;
        });

        $('#view_space_descriptions').click(function(e){
            e.preventDefault();
            if (mobile) {
                $('.popover').addClass("popover-mobile-override");
            }
            else {
                $('.popover').addClass("popover-desktop-override");
            }
        });

        // Scroll to the top of page
        $('#top_link').click(function(e){
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              scrollTo('top');
        });

        // Scroll to top of Filter list
        $('#filter_link').click(function(e){
              // Prevent a page reload when a link is pressed
              e.preventDefault();
              // Call the scroll function
              scrollTo('info_items');
        });

        // handle view details click
        $('.view-details').live('click', function(e){

            // get the space id
            id =  $(this).attr('id');

            e.preventDefault();

            // if a space details already exists
            if ($('#space_detail_container').is(':visible')) {
                replaceSpaceDetails(id);
            }
            else {
                showSpaceDetails(id);
            }

        });

        $('#space_detail_container .close').live('click', function(e){
            e.preventDefault();
            hideSpaceDetails();
        });

        // fancy location select
        $("#e9").select2({
                placeholder: "Select a building",
                allowClear: true
            });

        // handle checkbox and radio button clicks
        $('.checkbox input:checkbox').click(function() {
            if(this.checked) {
                $(this).parent().addClass("selected");
            }
            else {
                $(this).parent().removeClass("selected");
            }
        });


        $('#filter_hours input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#hours_list_input').is(':checked')) {
                scrollTo('filter_hours');
                $('#hours_list_container').show();
            }
            else {
                $('#hours_list_container').hide();
            }
        });

        $('#filter_location input:radio').change(function() {
            $(this).parent().addClass("selected");
            $(this).parent().siblings().removeClass("selected");

            if ($('#building_list_input').is(':checked')) {
                scrollTo('filter_location');
                $('#building_list_container').show();
            }
            else {
                $('#building_list_container').hide();
            }

        });

	});

	$(w).resize(function(){ //Update dimensions on resize
		sw = document.body.clientWidth;
		checkMobile();
	});

	// Show space details
	function showSpaceDetails(id) {

    	// remove any open details
    	$('#space_detail_container').remove();

    	console.log("the following id was passed: " + id);

    	if (!mobile) { // if desktop

    	   // build the template
    	   var source = $('#space_details').html();
    	   var template = Handlebars.compile(source);
    	   $('#map_canvas').append(template(template));

    	   // set/reset initial state
    	   $('.space-detail-inner').hide();
    	   $(".space-detail .loading").show();
    	   $('#space_detail_container').show();

    	   $('#space_detail_container').height($('#map_canvas').height());
    	   $('.space-detail-body').height($('.space-detail').height() - 110);

    	   $('.space-detail').slideDown('slow', function() {
        	   setTimeout('$(".space-detail .loading").hide()', 1000);
        	   setTimeout('$(".space-detail-inner").show()', 1300);
    	   });

	   }
	   else { // TODO: mobile should open new page
    	   location.href = '/space/' + id;
	   }
	}

	function replaceSpaceDetails(id) {

    	console.log("the following id was passed: " + id);

    	if (!mobile) { // if desktop

    	   // build the template
    	   var source = $('#space_details_replace').html();
    	   var template = Handlebars.compile(source);
    	   $('#space_detail_container').html(template(template));

    	   // set/reset initial state
    	   $('.space-detail-inner').hide();
    	   $(".space-detail .loading").show();
    	   $('.space-detail-body').height($('.space-detail').height() - 110);

    	   $('.space-detail').show();

    	   setTimeout('$(".space-detail .loading").hide()', 1000);
    	   setTimeout('$(".space-detail-inner").show()', 1300);
	   }
	   else { // TODO: mobile should open new page
    	   location.href = '/space/' + id;
	   }
	}

	function hideSpaceDetails() {
    	$('.space-detail').slideUp('slow', function() {
            // Animation complete.
            $('#space_detail_container').remove();
        });
	}

	// ScrollTo a spot on the UI
	function scrollTo(id) {
        // Scroll
        $('html,body').animate({
            scrollTop: $("#"+id).offset().top},speed);
    }

	// Check if Mobile
	function checkMobile() {
		mobile = (sw > breakpoint) ? false : true;
		if (!mobile) {
		  // desktop
		  resizeContent();
		} else {
		  // mobile
		  resetContent();
		}
	}

	// Resize Map and List
	function resizeContent() {

    	var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

        $('#map_canvas').height(contentH);
        $('#info_list').height(contentH);

        // make sure loading and list height fills the list container
        $('#info_list .list-inner').css('min-height', contentH);
        //$('.loading').height(contentH);
    }

    function resetContent() {

        var windowH = $(window).height();
        var headerH = $('#nav').height();
        //var contentH = windowH - headerH;
        //var mainContentH = windowH - headerH + 35;
        var mapH = windowH - headerH - 43; // enough to show the loading spinner at the bottom of the viewport

        $('#map_canvas').height(mapH);
        $('#info_list').height('auto');

        //$('#main_content').height(mainContentH);
        //$('#main_content').css({ minHeight: mainContentH });
    }


})(this);
