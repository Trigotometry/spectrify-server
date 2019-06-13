$( document ).ready( function() {

	randomiseBackground();

	$( "body" ).on( "click", randomiseBackground );

	$( ".prev" ).on( "click", function() {
		sendCommand("POST", "previous");
	} );

	$( ".next" ).on( "click", function() {
		sendCommand("POST", "next");
	} );

} );