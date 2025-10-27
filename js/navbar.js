// --- NEW js/navbar.js ---

(function() {
    // --- Configuration ---
    const INDEX_SPREADSHEET_ID = '1vYFBN66bOciRX_-Ic9DHoJ3exbxWq3VU0lkrNkylb3o';
    const RANGE = 'Sheet1!A2:C';
    // ---------------------

    /**
     * Extracts the Google Sheet ID from a full URL or returns the input if it's already an ID.
     */
    function getSheetId(input) {
        if (!input) return null;
        
        // Check if it's a full URL and extract the ID
        const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return match[1];
        }
        
        // Check if the input itself looks like an ID
        if (input.match(/^[a-zA-Z0-9_-]+$/) && input.length > 30) { 
            return input;
        }
        
        return null; // Not a valid URL or ID
    }

    /**
     * Main function to fetch data and build the object.
     */
    async function fetchAndBuildMapData() {
        try {
            // 1. Initialize the Google Sheets API client for the browser
            await gapi.client.init({
                'apiKey': API_KEY,
                'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            });

            // 2. Fetch the data from the spreadsheet
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: INDEX_SPREADSHEET_ID,
                range: RANGE,
            });

            const rows = response.result.values;
            const MAP_DATA = {}; // This is where we'll store the final object

            // 3. Process the rows if data was returned
            if (rows && rows.length > 0) {
                rows.forEach(row => {
                    const districtName = row[0]; // Data from Column A
                    const linkOrId = row[2];     // Data from Column C
                    
                    if (districtName && linkOrId) {
                        const mapSpreadSheetId = getSheetId(linkOrId);
                        const districtKey = districtName.trim().toLowerCase();
                        
                        if (mapSpreadSheetId) {
                            MAP_DATA[districtKey] = {
                                mapSpreadSheetId: mapSpreadSheetId,
                                name: districtName.trim(),
                                mapContainerId: districtKey
                            };
                        } else {
                            console.warn(`Could not get a valid Sheet ID for ${districtName}`);
                        }
                    }
                });

                // 4. Data is ready. Now, start the application.
                // This calls the function from 'app-starter.js'
                startApplication(MAP_DATA);

            } else {
                console.log('No data found in the spreadsheet.');
                alert('Error: No data found in the index spreadsheet.');
            }

        } catch (err) {
            console.error("Error fetching or processing spreadsheet data:", err);
            const msg = err.result ? err.result.error.message : "Error loading Google Sheets data. Check API key and spreadsheet permissions.";
            alert(msg);
        }
    }

    // This is the entry point. It loads the Google API client, 
    // and when it's ready, it calls our fetch function.
    gapi.load('client', fetchAndBuildMapData);

})();