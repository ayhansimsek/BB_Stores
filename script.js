$(document).ready(function() {
    var table = $('#example').DataTable({
        "paging": false,
        "info": false
    });

    $('#example tbody').on('click', 'td', function() {
        var cellIndex = table.cell(this).index().column;
        if ([0, 1, 2].includes(cellIndex)) {
            var text = $(this).text();
            navigator.clipboard.writeText(text).then(function() {
                console.log('Copied to clipboard:', text);
            }).catch(function(err) {
                console.error('Error copying text to clipboard:', err);
            });
        }
    });

    $('#example tbody').on('click', '.copyBtn', function(e) {
        e.stopPropagation();
        var address = $(this).data('address');
        navigator.clipboard.writeText(address);
    });

    $('#example tbody').on('click', '.printBtn', function() {
        var storeName = $(this).data('store');
        var storePhone = $(this).data('phone');
        var storeAddress = $(this).data('address');
        showPrintForm(storeName, storePhone, storeAddress);
    });
});

function showPrintForm(storeName, storePhone, storeAddress) {
    $('#printFormContainer').html(`
        <h4>Print Form for ${storeName}</h4>
        <form id="printForm">
            <div class="form-group">
                <label for="userName">Your Name:</label>
                <input type="text" class="form-control" id="userName">
            </div>
            <div class="form-group">
                <label for="ticketNumber">Ticket Number:</label>
                <input type="text" class="form-control" id="ticketNumber">
            </div>
            <div class="form-group" id="itemsContainer">
                <label>Items to Send:</label>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Item" name="items[]">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary removeItemBtn" type="button"><span>-</span></button>
                        <button class="btn btn-outline-secondary addItemBtn" type="button"><span>+</span></button>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="attnSelect">ATTN:</label>
                <select class="form-control" id="attnSelect">
                    <option value="STORE MANAGER">STORE MANAGER</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" class="form-control mt-2" id="otherAttn" style="display: none;" placeholder="Type name">
            </div>
            <button type="button" class="btn btn-primary" onclick="printContent('${storeName}', '${storePhone}', '${storeAddress}')">Print</button>
        </form>
    `).show();

    $('#attnSelect').change(function() {
        if ($(this).val() === "Other") {
            $('#otherAttn').show();
        } else {
            $('#otherAttn').hide();
        }
    });

    // Initially hide the remove button if only one item input exists
    updateItemButtons();

    // Add event delegation for dynamically added elements
    $('#printForm').on('click', '.addItemBtn', function() {
        addItemInput();
    });

    $('#printForm').on('click', '.removeItemBtn', function() {
        $(this).closest('.input-group').remove();
        updateItemButtons();
    });
}

function addItemInput() {
    var newItemInput = $(`<div class="input-group mb-3"><input type="text" class="form-control" placeholder="Item" name="items[]"><div class="input-group-append"><button class="btn btn-outline-secondary removeItemBtn" type="button"><span>-</span></button></div></div>`);
    $('#itemsContainer').append(newItemInput);
    updateItemButtons();
}

function updateItemButtons() {
    if ($('#itemsContainer .input-group').length > 1) {
        $('.removeItemBtn').show();
    } else {
        $('.removeItemBtn').hide();
    }
}

function printContent(storeName, storePhone, storeAddress) {
    const userName = $('#userName').val();
    const ticketNumber = $('#ticketNumber').val().trim();
    const attnSelectValue = $('#attnSelect').val();
    const attn = attnSelectValue === "Other" ? $('#otherAttn').val() : attnSelectValue;
    const items = $('input[name="items[]"]').map(function() { return $(this).val().trim(); }).get().filter(item => item !== '');

    let ticketNumberHtml = ticketNumber ? `<p>Ticket Number: ${ticketNumber}</p>` : '';
    let itemsHtml = items.map(item => `. ${item}`).join('<br>');

    let printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Preview</title>
                <style>
                @media print {
                    body {
                        
                        font-size: 12pt;
                    }
                    
                    h2, p, .form-group label, input, select, button {
                        font-size: 12pt; /* Adjust font sizes for readability */
                    }
                    .form-group {
                        margin-bottom: 5px; /* Reduce spacing between form groups */
                    }
                    .input-group {
                        flex-direction: column; /* Stack input group children vertically */
                    }
                    .input-group .form-control {
                        margin-bottom: 2px; /* Reduce margin for stacked elements */
                    }
                    .btn {
                        font-size: 7px; /* Smaller buttons */
                        padding: 2px; /* Reduce button padding */
                    }
                    .hide-on-print {
                        display: none; /* Hide elements not needed for print */
                    }
                    /* Further adjust spacing and layout as needed */
                }
                    .returning{page-break-before: always;}
                </style>
            </head>
            <body>
                <div class="content">
                    <h2>To:</h2>
                    <p>Store Name: ${storeName}</p>
                    <p>ATTN: ${attn}</p>
                    <p>Store Address: ${storeAddress}</p>
                    <p>Store Phone: ${storePhone}</p>
                    ${ticketNumberHtml}
                    <div class="items">
                        <h3>Items:</h3>
                        ${itemsHtml}
                    </div>
                    <div class="from">
                        <h3>From:</h3>
                        <p>Name: ${userName}</p>
                        <p>Baby Bunting IT</p>
                        <p>153 National Dr, Dandenong South VIC 3175</p>
                    </div>
                </div>
                <div class="returning">
                    <p>&nbsp;</p>
                    <h2>Please attach this to</h2>  
                    <h2>Returning equipment</h2>
                    <p>&nbsp;</p>
                    <p>From: ${storeName} Baby Bunting</p>
                    <p>To: Baby Bunting IT</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}



// store status indicator

function updateStoreStatus() {
    // Define store opening and closing times
    const openingTime = moment().hour(9).minute(0); // 9:00 AM
    const closingTime = moment().hour(17).minute(30); // 5:30 PM
    

    // Example time zones for stores, adjust as necessary
    const timeZones = {
        'Hawthorn': 'Australia/Melbourne',
'Ringwood Eastland': 'Australia/Melbourne',
'Bentleigh': 'Australia/Melbourne',
'Maribyrnong': 'Australia/Melbourne',
'Narre Warren': 'Australia/Melbourne',
'Thomastown': 'Australia/Melbourne',
'Frankston': 'Australia/Melbourne',
'Melrose Park': 'Australia/Adelaide',
'Gepps Cross': 'Australia/Adelaide',
'Moore Park': 'Australia/Sydney',
'Geelong': 'Australia/Melbourne',
'Hoppers Crossing': 'Australia/Melbourne',
'Auburn': 'Australia/Sydney',
'Fyshwick': 'Australia/Canberra',
'Penrith': 'Australia/Sydney',
'Helensvale': 'Australia/Brisbane',
'Myaree': 'Australia/Perth',
'Cannington': 'Australia/Perth',
'Kawana': 'Australia/Brisbane',
'Fortitude Valley': 'Australia/Brisbane',
'Warners Bay': 'Australia/Sydney',
'Taren Point': 'Australia/Sydney',
'Joondalup': 'Australia/Perth',
'Midland': 'Australia/Perth',
'Osborne Park': 'Australia/Perth',
'Townsville': 'Australia/Brisbane',
'Taylors Lakes': 'Australia/Melbourne',
'Macgregor': 'Australia/Brisbane',
'Ballarat': 'Australia/Melbourne',
'West Gosford': 'Australia/Sydney',
'Bendigo': 'Australia/Melbourne',
'Booval': 'Australia/Brisbane',
'North Lakes': 'Australia/Brisbane',
'Burleigh Waters': 'Australia/Brisbane',
'Campbelltown': 'Australia/Sydney',
'Capalaba': 'Australia/Brisbane',
'Preston': 'Australia/Melbourne',
'Baldivis': 'Australia/Perth',
'Belrose': 'Australia/Sydney',
'Mile End': 'Australia/Adelaide',
'Blacktown': 'Australia/Sydney',
'Munno Para': 'Australia/Adelaide',
'Albury': 'Australia/Melbourne',
'Aspley': 'Australia/Brisbane',
'Rutherford': 'Australia/Sydney',
'Browns Plains': 'Australia/Brisbane',
'Toowoomba': 'Australia/Brisbane',
'Chatswood': 'Australia/Sydney',
'Glenorchy': 'Australia/Hobart',
'Bankstown': 'Australia/Sydney',
'Chadstone': 'Australia/Melbourne',
'Shellharbour': 'Australia/Sydney',
'Doncaster': 'Australia/Melbourne',
'Wetherill Park': 'Australia/Sydney',
'Casula': 'Australia/Sydney',
'Knox': 'Australia/Melbourne',
'Castle Towers': 'Australia/Sydney',
'Coffs Harbour': 'Australia/Sydney',
'Belconnen': 'Australia/Canberra',
'Alexandria': 'Australia/Sydney',
'Wagga Wagga': 'Australia/Sydney',
'Cairns': 'Australia/Brisbane',
'Burnside': 'Australia/Melbourne',
'Hornsby': 'Australia/Sydney',
'Hectorville': 'Australia/Adelaide',
'Chirnside Park': 'Australia/Melbourne',
'Loganholme': 'Australia/Brisbane',
'Orange': 'Australia/Sydney',
'Cranbourne': 'Australia/Melbourne',
'Albany': 'New Zealand/Auckland',
'Christchurch': 'New Zealand/Christchurch',
'Sylvia Park': 'New Zealand/Auckland',
'Manukau': 'New Zealand/Auckland',


    };

    $('#example tbody tr').each(function() {
        const storeName = $(this).find('td:nth-child(2)').text().trim();
        const timeZone = timeZones[storeName];
        const currentTime = moment.tz(timeZone);

        const isOpen = currentTime.isBetween(openingTime, closingTime, 'minutes', '[]'); // '[]' includes both start and end time

        $(this).find('.store-status').addClass(isOpen ? 'open' : 'closed').text(isOpen ? '🟢' : '🔴');
    });
}

// Call the function on document ready and optionally at regular intervals
$(document).ready(function() {
    updateStoreStatus();
    // Update status every 5 minutes to keep it current
    setInterval(updateStoreStatus, 300000);
});
