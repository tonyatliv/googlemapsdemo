# googlemaps
For drawing labels on maps

If you need a maps page with geographically placed icons in it, here is a brief example.

The minimum data needed is a value (number) or label(text) and a location (postcode or lat/long). See the mapdata_test.xml file for a small example.

The size and colour is computed from the value - this can be changed in the makemap.js file, createMarkerImage function.

If a label is specified in the xml data, this is displayed instead of the value (but value is used to get colour and size). If no value is specified, 0 is used.

Other optional attributes are hover text (hover), and popup text (html).  If the data is to be read from a database, or otherwise generated, change getmapdata.php to return the data in xml format.  This is called when the page is loaded or the dataset is changed.

When having a choice of datasets, they should be changed in both index.html as well as getmapdata.php - getmapdata.php should not be able to load arbitrary filenames as this represents a security risk.

The initial window position is specified in makemap.js, but once the markers are loaded it is automatically zoomed to contain them.

A test version is live at pgb.liv.ac.uk/~tony/testmap

You should get your own google API key, and insert it in index.html
https://developers.google.com/maps/documentation/javascript/get-api-key


