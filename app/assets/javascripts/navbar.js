$( document ).ready( function() {

	$( "#nav-slide" ).fadeTo( 0, 0 );

	$( "#nav-slide" ).on( "mouseenter", function() {
		$( this ).fadeTo( 250, 100 );
	} );

	$( "#nav-slide" ).on( "mouseleave", function() {
		$( this ).fadeTo( 750, 0 );
	} );

} );