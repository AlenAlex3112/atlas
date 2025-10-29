// --- FINAL CORRECTED js/app.js ---

/**
 * This function is called by app-starter.js.
 * @param {Array} rootData - The array of items from the master sheet.
 */
function initializeRouter(rootData) {

    const app = $.sammy('#main', function () {
        // --- Caches and Element Selectors ---
        const maps = {}; // Caches loaded maps
        const gapiCache = {}; // Caches fetched sheet data to avoid re-fetching
        const $dropdownMenu = $('#district-nav-pills');
        const $dropdownButton = $('#district-selector-btn');

        // --- Helper Function: Get Sheet ID ---
        function getSheetId(input) {
            if (!input) return null;
            const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                return match[1];
            }
            if (input.match(/^[a-zA-Z0-9_-]+$/) && input.length > 30) {
                return input;
            }
            return null;
        }

        // --- Helper Function: Fetch Sheet Data ---
        async function gapiFetch(sheetId) {
            if (gapiCache[sheetId]) {
                return gapiCache[sheetId];
            }
            
            try {
                const response = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: sheetId,
                    range: 'Sheet1!A2:C', // Assumes: Name, last_sheet, link
                });

                const rows = response.result.values;
                const items = [];
                if (rows && rows.length > 0) {
                    rows.forEach(row => {
                        const name = row[0];
                        const last_sheet = row[1];
                        const link = row[2];
                        
                        if (name && last_sheet && link) {
                            items.push({
                                name: name.trim(),
                                last_sheet: last_sheet.trim(),
                                link: link.trim(),
                                sheetId: getSheetId(link.trim())
                            });
                        }
                    });
                }
                gapiCache[sheetId] = items; 
                return items;

            } catch (err) {
                console.error("Error fetching sheet data:", err);
                const msg = err.result ? err.result.error.message : "Error loading sub-sheet data.";
                $('.page-alert-box .modal-body').html('<p>' + msg + '</p>');
                $('.page-alert-box').modal('show');
                return []; 
            }
        }
        
        // --- Helper Function: Populate Dropdown ---
        function populateDropdown(items, pathPrefix) {
            $dropdownMenu.empty();
            if (!items) return;

            items.forEach(item => {
                const itemNameKey = item.name.trim().toLowerCase();
                const newHref = pathPrefix + itemNameKey;
                $dropdownMenu.append(`<li><a href="${newHref}">${item.name}</a></li>`);
            });
        }
        
        // --- Helper Function: Load Map ---
        function loadMap(mapItem, mapContainerId) {
            const mapOptions = {
                mapSpreadSheetId: mapItem.sheetId,
                name: mapItem.name,
                mapContainerId: mapContainerId
            };
            
            if ($('#' + mapContainerId).length === 0) {
                const mapHtml = `<div role="tabpanel" class="tab-pane map-container" id="${mapContainerId}"></div>`;
                $('#map-tab-content').append(mapHtml);
            }
            
            $('#' + mapContainerId).addClass('active');

            const map = maps[mapContainerId] ? maps[mapContainerId] : BirdCount.createMap(mapOptions);
            maps[mapContainerId] = map;
            map.recenter();
        }

        // --- THIS IS THE CORE RECURSIVE LOGIC ---
        async function handleRoute() {
            // 'this' is the sammy.js context
            
            // *** NEW LOGIC TO GET PATH ***
            // We build the 'parts' array from the named parameters
            const parts = [];
            let path = ""; // This will be used for the map ID
            
            if (this.params.p1) { parts.push(this.params.p1); path = this.params.p1; }
            if (this.params.p2) { parts.push(this.params.p2); path += '/' + this.params.p2; }
            if (this.params.p3) { parts.push(this.params.p3); path += '/' + this.params.p3; }
            if (this.params.p4) { parts.push(this.params.p4); path += '/' + this.params.p4; }
            // Add more (p5, p6) if you ever need deeper nesting
            
            let currentItems = rootData; 
            let currentPathPrefix = '#/';
            let lastItemName = "Select an Item";
            
            $('.map-parent .tab-pane').removeClass('active');

            for (const part of parts) {
                const decodedPart = decodeURIComponent(part);
                const selectedItem = currentItems.find(item => item.name.trim().toLowerCase() === decodedPart);

                if (!selectedItem) {
                    console.error(`Invalid path part: ${decodedPart}`);
                    this.redirect('#/');
                    return;
                }

                lastItemName = selectedItem.name; 

                if (selectedItem.last_sheet === '1') {
                    const mapContainerId = 'map-' + path.replace(/[^a-z0-9]/g, '-');
                    loadMap(selectedItem, mapContainerId);
                    populateDropdown(currentItems, currentPathPrefix); 
                    $dropdownButton.html(lastItemName + ' <span class="caret"></span>');
                    return; 
                }
                
                if (selectedItem.last_sheet === '0') {
                    currentItems = await gapiFetch(selectedItem.sheetId);
                    currentPathPrefix += part + '/';
                }
            }

            populateDropdown(currentItems, currentPathPrefix);
            $dropdownButton.html(lastItemName + ' <span class="caret"></span>');
        }

        // --- THE FINAL CORRECTED SAMMY.JS ROUTES ---
        // These routes are explicit and will not fail. (Assuming a max depth of 6)
        this.get('#/', handleRoute);
        this.get('#/:p1', handleRoute);
        this.get('#/:p1/:p2', handleRoute);
        this.get('#/:p1/:p2/:p3', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6', handleRoute);

    });

    // Start the app router, run the logic for the current URL
    app.run(location.hash || '#/');

    // Click handler for collapsing the mobile navbar
    const navbar = $("#navbar");
    $(document).on('click', '#district-nav-pills a', function(e) {
        navbar.collapse('hide');
    });
}