
// ---------------------------------------------------------------
module( "maslo-utils" );

test( "readJSON()", function() {
        json = readJSON("test/basic.json");
        ok( json["firstName"] == "John", "Value is set properly");
    });

test( "error()", function() {
        ok( error("Foo") == false, "Error properly returns false");
    });


// ---------------------------------------------------------------
module( "user-interaction" );

// This test does not work because the DOM is built in index.html.
// Since the tests are currently loading from test.html there are no
// footer and footerAlt elements to modify.

/*
test( "more", function() {
        var event = $.Event("click", { target: 'TDmore' });
        var doc = $( document );
        doc.trigger(event);

        alert($('#head').html())
        ok( $('#footer').is(':hidden'), "footer became hidden" )
        ok( $('#footerAlt').is(':visible'), "footerAlt became visible" )
    });
*/