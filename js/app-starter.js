// --- NEW js/app-starter.js ---

/**
 * This function is called by navbar.js *after* the MAP_DATA is fetched.
 * @param {object} MAP_DATA - The object containing district info.
 */
function startApplication(MAP_DATA) {
    
    // 1. Get the empty HTML containers
    const $navPills = $('#district-nav-pills');
    const $mapTabContent = $('#map-tab-content');

    // 2. Build the HTML dynamically
    Object.keys(MAP_DATA).forEach(key => {
        const district = MAP_DATA[key];
        
        // Create the navbar link
        const navHtml = `
            <li role="presentation">
                <a href="#/kerala/${district.mapContainerId}" role="tab" data-target="#${district.mapContainerId}" data-toggle="tab">${district.name}</a>
            </li>`;
        
        // Create the map container div
        const mapHtml = `
            <div role="tabpanel" class="tab-pane map-container" id="${district.mapContainerId}"></div>`;

        // Add them to the page
        $navPills.append(navHtml);
        $mapTabContent.append(mapHtml);
    });

    // 3. Now that the HTML is built, start the router
    // This calls the function from your modified 'app.js'
    initializeRouter(MAP_DATA);
}