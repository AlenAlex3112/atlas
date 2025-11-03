// --- UPDATED app.js (Pills instead of Dropdown) ---

/**
 * This function is called by app-starter.js.
 * @param {Array} rootData - The array of items from the master sheet.
 */
function initializeRouter(rootData) {

    const app = $.sammy('#main', function () {
        // --- Caches and Element Selectors ---
        const maps = {}; // Caches loaded maps
        const gapiCache = {}; // Caches fetched sheet data
        // *** UPDATED: Removed dropdown, added navPills ***
        const $navPills = $('#nav-pills-container'); 
        const $backButton = $('#back-button-li');

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
                    range: 'Sheet1!A2:D', // Assumes: Name, last_sheet, link, default
                });

                const rows = response.result.values;
                const items = [];
                if (rows && rows.length > 0) {
                    rows.forEach(row => {
                        const name = row[0];
                        const last_sheet = row[1];
                        const link = row[2];
                        const is_default = row[3]; 
                        
                        if (name && last_sheet && link) {
                            items.push({
                                name: name.trim(),
                                last_sheet: last_sheet.trim(),
                                link: link.trim(),
                                sheetId: getSheetId(link.trim()),
                                default: is_default ? is_default.trim() : '0' 
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
        
        // --- *** NEW: Helper Function: Populate Pills *** ---
        // This replaces populateDropdown
        function populatePills(items, pathPrefix, activePart) {
            $navPills.empty();
            if (!items) return;

            items.forEach(item => {
                const itemNameKey = item.name.trim().toLowerCase();
                const newHref = pathPrefix + itemNameKey;
                
                // Check if this item is the active one
                const activeClass = (itemNameKey === activePart) ? 'active' : '';
                
                // Create the pill
                $navPills.append(
                    `<li role="presentation" class="${activeClass}">
                        <a href="${newHref}">${item.name}</a>
                    </li>`
                );
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
            const parts = [];
            let path = ""; 
            
            if (this.params.p1) { parts.push(this.params.p1); path = this.params.p1; }
            if (this.params.p2) { parts.push(this.params.p2); path += '/' + this.params.p2; }
            if (this.params.p3) { parts.push(this.params.p3); path += '/' + this.params.p3; }
            if (this.params.p4) { parts.push(this.params.p4); path += '/' + this.params.p4; }
            if (this.params.p5) { parts.push(this.params.p5); path += '/' + this.params.p5; }
            if (this.params.p6) { parts.push(this.params.p6); path += '/' + this.params.p6; }
            if (this.params.p7) { parts.push(this.params.p7); path += '/' + this.params.p7; }
            if (this.params.p8) { parts.push(this.params.p8); path += '/' + this.params.p8; }
            if (this.params.p9) { parts.push(this.params.p9); path += '/' + this.params.p9; }
            if (this.params.p10) { parts.push(this.params.p10); path += '/' + this.params.p10; }
            if (this.params.p11) { parts.push(this.params.p11); path += '/' + this.params.p11; }
            if (this.params.p12) { parts.push(this.params.p12); path += '/' + this.params.p12; }
            
            if (path.length > 0) {
                $backButton.show();
            } else {
                $backButton.hide();
            }
            
            let currentItems = rootData; 
            let currentPathPrefix = '#/';
            
            $('.map-parent .tab-pane').removeClass('active');

            for (const part of parts) {
                const decodedPart = decodeURIComponent(part);
                const selectedItem = currentItems.find(item => item.name.trim().toLowerCase() === decodedPart);

                if (!selectedItem) {
                    console.error(`Invalid path part: ${decodedPart}`);
                    this.redirect('#/');
                    return;
                }

                if (selectedItem.last_sheet === '1') {
                    const mapContainerId = 'map-' + path.replace(/[^a-z0-9]/g, '-');
                    loadMap(selectedItem, mapContainerId);
                    
                    // *** UPDATED: Populate pills and set the active one ***
                    populatePills(currentItems, currentPathPrefix, part); 
                    return; 
                }
                
                if (selectedItem.last_sheet === '0') {
                    currentItems = await gapiFetch(selectedItem.sheetId);
                    currentPathPrefix += part + '/';
                }
            }

            if (currentItems && currentItems.length > 0) {
                const defaultItem = currentItems.find(item => item.default === '1');
                
                if (defaultItem) {
                    const defaultItemKey = defaultItem.name.trim().toLowerCase();
                    const newHash = currentPathPrefix + defaultItemKey;
                    this.redirect(newHash);
                    return; 
                }
            }
            
            // *** UPDATED: Populate pills, no active item ***
            populatePills(currentItems, currentPathPrefix, null);
        }

        // --- THE SAMMY.JS ROUTES (Correct Order) ---
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6/:p7', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5/:p6', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4/:p5', handleRoute);
        this.get('#/:p1/:p2/:p3/:p4', handleRoute);
        this.get('#/:p1/:p2/:p3', handleRoute);
        this.get('#/:p1/:p2', handleRoute);
        this.get('#/:p1', handleRoute);
        this.get('#/', handleRoute); // Least specific (root) route LAST

    });

    // Start the app router
    app.run(location.hash || '#/');

    // --- Click handler for the back button ---
    $(document).on('click', '#back-button', function(e) {
        e.preventDefault(); 
        
        const currentHash = location.hash; 
        const parts = currentHash.split('/').filter(p => p.length > 0 && p !== '#');
        
        parts.pop(); 
        
        let newHash = '#/';
        if (parts.length > 0) {
            newHash += parts.join('/'); 
        }
        
        location.hash = newHash; 
    });

    // *** UPDATED: Click handler now targets pills and dropdown items (for mobile) ***
    const navbar = $("#navbar");
    $(document).on('click', '#nav-pills-container a, #district-nav-pills a', function(e) {
        // We don't need to do e.preventDefault() because the hash change
        // is what triggers the router.
        
        // Collapse the mobile navbar after a click
        navbar.collapse('hide');
    });
}