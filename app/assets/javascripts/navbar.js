$( document ).ready( function() {

	$( "#nav-slide" ).fadeTo( 5000, 0 );

	$( "#nav-slide" ).on( "mouseenter", function() {
		$( this ).fadeTo( 250, 100 );
	} );

	$( "#nav-slide" ).on( "mouseleave", function() {
		$( this ).fadeTo( 1000, 0 );
	} );

} );