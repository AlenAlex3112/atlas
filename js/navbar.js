// --- NEW RECURSIVE js/navbar.js ---

(function() {
    // 1. Set the new master sheet ID
    const MASTER_SHEET_ID = '1fUqe-a3brySWDt47s4gdeYjA2aBFuzAjFv9A68QFUZA';
    const RANGE = 'Sheet1!A2:C'; // Assumes columns: Name, last_sheet, link

    /**
     * Extracts the Google Sheet ID from a full URL or returns the input if it's already an ID.
     */
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

    /**
     * This function now just fetches the *root* list of items.
     */
    async function fetchAndBuildRootData() {
        try {
            await gapi.client.init({
                'apiKey': API_KEY, // From api-key.js
                'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            });

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: MASTER_SHEET_ID,
                range: RANGE,
            });

            const rows = response.result.values;
            const rootData = []; // This is now just an array

            if (rows && rows.length > 0) {
                rows.forEach(row => {
                    const name = row[0];
                    const last_sheet = row[1];
                    const link = row[2];
                    
                    if (name && last_sheet && link) {
                        rootData.push({
                            name: name.trim(),
                            last_sheet: last_sheet.trim(),
                            link: link.trim(),
                            sheetId: getSheetId(link.trim())
                        });
                    }
                });

                // Pass the initial array to the starter
                startApplication(rootData); 

            } else {
                console.log('No data found in the master spreadsheet.');
                alert('Error: No data found in the master spreadsheet.');
            }

        } catch (err) {
            console.error("Error fetching or processing master spreadsheet data:", err);
            const msg = err.result ? err.result.error.message : "Error loading master sheet. Check API key and spreadsheet permissions.";
            
            $('.page-alert-box .modal-body').html('<p>' + msg + '</p>');
            $('.page-alert-box').modal('show');
        }
    }

    // Call the new function
    gapi.load('client', fetchAndBuildRootData);

})();