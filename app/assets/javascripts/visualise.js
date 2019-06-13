function randomiseBackground() {
	let randomColourOne = "#000000".replace( /0/g, function() {
		return ( ~~( Math.random() * 16 ) ).toString( 16 );
	} );

	let randomColourTwo = "#000000".replace( /0/g, function() {
		return ( ~~( Math.random() * 16 ) ).toString( 16 );
	} );

	let background = $( "body" );
	background.css( "background", `linear-gradient( ${ randomColourOne }, ${ randomColourTwo } )` );
}