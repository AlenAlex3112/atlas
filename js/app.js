// --- MODIFIED js/app.js ---

/**
 * This function now wraps all your original routing logic.
 * It is called by app-starter.js.
 * @param {object} MAP_DATA - The object containing district info.
 */
function initializeRouter(MAP_DATA) {

    const app = $.sammy('#main', function () {
        const maps = {};

        function getOrCreateMap(id) {
            let map = maps[id];
            if (!map) {
                // Pass the MAP_DATA for this specific ID to the createMap function
                map = BirdCount.createMap(MAP_DATA[id]);
                maps[id] = map;
            }
            return map;
        }

        this.get('#/', function (context) {
            // Get the *first* dynamically created link
            const first = $('ul.nav a:first').attr('href');
            if (first) {
                this.redirect(first);
            } else {
                console.error("No districts found to redirect to.");
            }
        });

        this.get('#/kerala/:district', function (context) {
            const district = this.params['district'],
                map = getOrCreateMap(district);
            $('ul.nav a[data-target="#' + district + '"]').tab('show');
            map.recenter();
        });
    });

    // Start the app router
    app.run('#/');

    // Attach click listeners to the new dynamic links
    const navbar = $("#navbar");
    $('ul.nav a').click(function (e) {
        app.setLocation($(this).attr('href'));
        navbar.collapse('hide');
    });
}