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
    <style>
    @page section1
      {size:595.3pt 841.9pt;
      margin:36.0pt 36.0pt 36.0pt 36.0pt;
      }
    div.section1
      {page:section1;}
  
    .section2{
      page-break-before: always;
    }
    .section2 h2{
      font-size:24pt;
    }
    .section2 p{
      font-size: 15pt;
    } 
  
    body{
      display: flex;
      margin-left: 12%;
    }
    </style>
    </head>
  
  
    <body  style='word-wrap:break-word'>
  
      <div class="section1">
        <h2>To:</h2>
        <p>Store Name: ${storeName}</p>
        <p>ATTN: ${attn}</p>
        <p>Store Address: ${storeAddress}</p>
        <p>Store Phone: ${storePhone}</p>
        ${ticketNumberHtml}
        
        
      <div class="section1">
          <h3>From:</h3>
          <p>Name: ${userName}</p>
          <p>Baby Bunting IT</p>
          <p>153 National Dr, Dandenong South VIC 3175</p>
          <h3>Items:</h3>
          ${itemsHtml}

          <div class="section1 section2">
            <h2>Please attach this to</h2>  
            <h2>Returning equipment</h2>
            <span>&nbsp;</span>
            <h2>From:</h2>
            <p>${storeName} </p>
            <h2>To:</h2>
            <p>${userName} (IT Department)</p>
       
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
    const openingHour = 9;
    const closingHour = 17;
    const closingMinutes = 30;
    

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
'Albany': 'Pacific/Auckland',
'Christchurch': 'Pacific/Auckland',
'Sylvia Park': 'Pacific/Auckland',
'Manukau': 'Pacific/Auckland',


    };

    $('#example tbody tr').each(function() {
        const storeName = $(this).find('td:nth-child(2)').text().trim();
        const timeZone = timeZones[storeName];
        const currentTime = moment.tz(timeZone);
        const isOpen = (currentTime.hour() > openingHour || (currentTime.hour() === openingHour && currentTime.minutes() >= 0)) && 
                       (currentTime.hour() < closingHour || (currentTime.hour() === closingHour && currentTime.minutes() < closingMinutes));

        $(this).find('.store-status').removeClass('open closed').addClass(isOpen ? 'open' : 'closed').text(isOpen ? '🟢' : '🔴');
    });
}

// Call the function on document ready and optionally at regular intervals
$(document).ready(function() {
    updateStoreStatus();
    // Update status every minute to keep it current
    setInterval(updateStoreStatus, 60000);
});
