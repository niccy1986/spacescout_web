var detailsLat, detailsLon;

// Handlebars helpers
Handlebars.registerHelper('carouselimages', function(spacedata) {
    var space_id = spacedata.id;
    var elements = new Array;
    for (i=0; i < spacedata.images.length; i++) {
        image_id = spacedata.images[i].id;
        elements.push('<div class="item"><img src="/space/'+space_id+'/image/'+image_id+'/thumb/500x333" class="img"></div>');
    }
    return new Handlebars.SafeString(elements.join('\n'));
});

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});


Handlebars.registerHelper('ifany', function(a, b) {

    // if anything passed is true, return true
    if (a || b) {
        return fn(this);
    }
});

(function(d){

	var sw = document.body.clientWidth,
		breakpoint = 767,
		speed = 600,
		mobile = true;

    var deviceAgent = navigator.userAgent.toLowerCase();
	var iphone = deviceAgent.match(/(iphone|ipod)/);

	$(document).ready(function() {

        var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var date = new Date();
        var hour = date.getHours();
        var min = date.getMinutes();


        if (min < 16) {
            min = "00";
        }else if (min < 46) {
            min = "30";
        }else {
            min = "00";
            hour++;
        }

        if (hour > 11) {
            $("#ampm-from").val("PM");
        }else {
            $("#ampm-from").val("AM");
        }
        if (hour > 12) {
            hour = hour-12;
        }
        hour = ""+hour+":"+min;
        $("#day-from").val(weekdays[date.getDay()]);
        $("#hour-from").val(hour);
		desktopContent();

	   // check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }

		// show filter panel
		$('#filter_button').click(function() {

            $("#filter_block").slideDown(400);

            $('#filter_button').hide();
            $('#view_results_button').show();
            $('#cancel_results_button').show();

        });

        // clear filters
        $('#cancel_results_button').click(function() {

            // clear saved search options
            if ($.cookie('spacescout_search_opts')) {
                $.removeCookie('spacescout_search_opts');
            }

            // reset checkboxes
            $('input[type=checkbox]').each(function() {
                if ($(this).attr('checked')) {
                    $(this).attr('checked', false);
                    $(this).parent().removeClass("selected");
                }
            });

            // reset capacity
            $('#capacity').val('1');

            // reset hours
            $('#open_now').prop('checked', true);
            $('#open_now').parent().removeClass("selected");
            $('#hours_list_container').hide();
            $('#hours_list_input').parent().removeClass("selected");
            var date = new Date();
            var hour = date.getHours();
            var min = date.getMinutes();


            if (min < 16) {
                min = "00";
            }else if (min < 46) {
                min = "30";
            }else {
                min = "00";
                hour++;
            }

            if (hour > 11) {
                $("#ampm-from").val("PM");
            }else {
                $("#ampm-from").val("AM");
            }
            if (hour > 12) {
                hour = hour-12;
            }
            hour = ""+hour+":"+min;
            $("#day-from").val(weekdays[date.getDay()]);
            $("#hour-from").val(hour);

            $("#day-until").val("No pref")
            $("#hour-until").val("No pref")
            $("#ampm-until").val("AM")

            // reset location
            $('#entire_campus').prop('checked', true);
            $('#entire_campus').parent().removeClass("selected");
            $('#e9.building-location').children().children().first()[0].selected = true; // grabs first location in drop down and selects it
            $('#building_list_container').hide();
            $('#building_list_input').parent().removeClass("selected");
            $('#building_list_container').children().children().children(".select2-search-choice").remove();
            $('#building_list_container').children().children().children().children().val('Select building(s)');
            $('#building_list_container').children().children().children().children().attr('style', "");
        });


        // handle view details click
        $('.view-details').live('click', function(e){

            // get the space id
            id =  $(this).find('.space-detail-list-item').attr('id');

            e.preventDefault();

            // clear any uneeded ajax window.requests
            for (i = 0; i < window.requests.length; i++) {
                window.requests[i].abort();
            }
            // if a space details already exists
            if ($('#space_detail_container').is(':visible')) {
                window.requests.push(
                    $.ajax({
                        url: '/space/'+id+'/json/',
                        success: replaceSpaceDetails
                    })
                );
            }
            else {
                window.requests.push(
                    $.ajax({
                        url: '/space/'+id+'/json/',
                        success: showSpaceDetails
                    })
                );
            }

             // clear previously selected space
            $('#info_items li').removeClass('selected');

            //highlight the selected space
            $(this).addClass('selected');

        });

        $('#space_detail_container .close').live('click', function(e){
            e.preventDefault();
            hideSpaceDetails();
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
                $('#building_list_container').show();
            }
            else {
                $('#building_list_container').hide();
            }

        });

        // Toggle between carousel and map
        $('.space-image-map-buttons button').live('click', function(e){

            if ($('#carouselControl').hasClass('active')) { // show the carousel
                $('#spaceCarouselContainer').show();
                $('#spaceMap').hide();
            }
            else { //show the map
                $('#spaceCarouselContainer').hide();
                $('#spaceMap').show();
                getSpaceMap(detailsLat, detailsLon);
            }
        });





	});

	// Update dimensions on resize
	$(d).resize(function(){

        // desktop
        desktopContent();

        // if the space details is already open
        if ($('#space_detail_container').is(":visible")) {
            $('#space_detail_container').height($('#map_canvas').height());
            $('.space-detail-body').height($('.space-detail').height() - 98);

            resizeCarouselMapContainer();
        }

	});

	// Show space details (sliding transition)
	function showSpaceDetails(data) {
           // format last modified date
           var last_mod= new Date(data["last_modified"]);
           var month = last_mod.getMonth();
           var day = last_mod.getDate();
           var year = last_mod.getFullYear();
           data["last_modified"] = month + "/" + day + "/" + year;

           // check to see if the space has the following
           data["has_notes"] = ( ( data.extended_info.access_notes != null) || ( data.extended_info.reservation_notes != null) );
           data["has_resources"] = ( data.extended_info.has_computers != null || data.extended_info.has_displays != null || data.extended_info.has_outlets != null || data.extended_info.has_printing != null || data.extended_info.has_projector != null || data.extended_info.has_scanner != null || data.extended_info.has_whiteboards != null );

    	   // remove any open details
    	   $('#space_detail_container').remove();

        	// build the template
    	   var source = $('#space_details').html();
    	   var template = Handlebars.compile(source);
    	   $('#map_canvas').append(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').show();
    	   $('#space_detail_container').show();

    	   $('#space_detail_container').height($('#map_canvas').height());
    	   $('.space-detail-body').height($('.space-detail').height() - 98);

    	   $('.space-detail').show("slide", { direction: "right" }, 400);

    	   initializeCarousel();

    	   detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;

	}

	// Replace space details (inline loading of already slid panel)
	function replaceSpaceDetails(data) {
           // format last modified date
           var last_mod= new Date(data["last_modified"]);
           var month = last_mod.getMonth();
           var day = last_mod.getDate();
           var year = last_mod.getFullYear();
           data["last_modified"] = month + "/" + day + "/" + year;

           // check to see if the space has the following
           data["has_notes"] = ( ( data.extended_info.access_notes != null) || ( data.extended_info.reservation_notes != null) );
           data["has_resources"] = ( data.extended_info.has_computers != null || data.extended_info.has_displays != null || data.extended_info.has_outlets != null || data.extended_info.has_printing != null || data.extended_info.has_projector != null || data.extended_info.has_scanner != null || data.extended_info.has_whiteboards != null );

        	// build the template
    	   var source = $('#space_details_replace').html();
    	   var template = Handlebars.compile(source);
    	   $('#space_detail_container').html(template(data));

    	   // set/reset initial state
    	   $('.space-detail-inner').hide();
    	   //$(".space-detail .loading").show();

    	   $('.space-detail-body').height($('.space-detail').height() - 98);

    	   $('.space-detail').show();

    	   // wait before showing the new space
    	   //$(".space-detail-inner").delay(300).show(0, function() {
           //   initializeCarousel();
           //   resizeCarouselMapContainer();
           //});

            $('.space-detail-inner').show();
            initializeCarousel();

           // fade the new space in
           /*$('.space-detail-inner').fadeIn('200', function() {
                initializeCarousel();
            });*/

           detailsLat = data.location.latitude;
    	   detailsLon = data.location.longitude;

	}

	function hideSpaceDetails() {
        $('.space-detail').hide("slide", { direction: "right" }, 400, function() {
            $('#space_detail_container').remove();
        });

        // deselect selected space in list
        $('#info_items li').removeClass('selected');
	}



	// Desktop display defaults
	function desktopContent() {

    	var windowH = $(window).height();
        var headerH = $('#nav').height();
        var contentH = windowH - headerH;

        $('#map_canvas').height(contentH - 100);
        $('#info_list').height(contentH -80);

        // make sure loading and list height fills the list container
        $('#info_list .list-inner').css('min-height', contentH - 100);
        //$('.loading').height(contentH);
    }

    function initializeCarousel() {

        // initialize the carousel
        $('.carousel').each( function() {

            $(this).carousel({
                interval: false
            });

            // add carousel pagination
            var html = '<div class="carousel-nav" data-target="' + $(this).attr('id') + '"><ul>';

            for(var i = 0; i < $(this).find('.item').size(); i ++) {
                html += '<li><a';
                if(i == 0) {
                    html += ' class="active"';
                }

                html += ' href="#">•</a></li>';
            }

            html += '</ul></li>';
            $(this).before(html);

            //set the first item as active
            $(this).find(".item:first-child").addClass("active");

            // hide the controls and pagination if only 1 picture exists
            if ($(this).find('.item').length == 1) {
                $(this).find('.carousel-control').hide();
                $(this).prev().hide(); // hide carousel pagination container for single image carousels
            }

        }).bind('slid', function(e) {
            var nav = $('.carousel-nav[data-target="' + $(this).attr('id') + '"] ul');
            var index = $(this).find('.item.active').index();
            var item = nav.find('li').get(index);

            nav.find('li a.active').removeClass('active');
            $(item).find('a').addClass('active');
        });

        $('.carousel-nav a').bind('click', function(e) {
            var index = $(this).parent().index();
            var carousel = $('#' + $(this).closest('.carousel-nav').attr('data-target'));

            carousel.carousel(index);
            e.preventDefault();
        });

        resizeCarouselMapContainer();

    }

    function resizeCarouselMapContainer() {
        // get the width
        var containerW = $('.image-container').width();

        // calcuate height based on 3:2 aspect ratio
        var containerH = containerW / 1.5;

        $('.carousel').height(containerH);
        $('.map-container').height(containerH);


    }

})(this);
