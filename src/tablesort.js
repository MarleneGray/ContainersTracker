
document.addEventListener('DOMContentLoaded', () => {
  fetchFileList();
});

function fetchFileList() {
  return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      //console.log("xhr,",xhr);
      xhr.open('GET', '.');  // '.' refers to the current directory
      xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                  const csvFileNames = extractCsvFileNames(xhr.responseText);
                  // console.log('CSV File List:', csvFileNames);
                  // console.log(xhr.responseText);
                  resolve({ csvFileNames, responseText: xhr.responseText });
              } else {
                  console.error('Failed to fetch file list. Status:', xhr.status);
                  reject(xhr.status);
              }
          }
      };
      xhr.send();
  });}

let Promessa = fetchFileList(); 
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
  Promessa.then(result => {
      console.log(result.responseText);
      extractCsvFileNames(result.responseText);
      console.log("File name extractCsvFileNames(result.responseText)",extractCsvFileNames(result.responseText));
      tableBuilder(extractCsvFileNames(result.responseText))
     // tableBuilder(result.responseText);
  })
})
  


function extractCsvFileNames(htmlContent) {
  console.log(htmlContent);
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  //console.log(htmlContent);

  // Extract file names from the HTML content
  const fileNames = Array.from(doc.querySelectorAll('a')).map(link => link.textContent.trim());
  fileNames.shift();
  console.log(fileNames);
  // Filter only .csv files
  const csvFileNames = fileNames.filter(fileName => fileName.toLowerCase().substring(0,44).endsWith('.csv'));
  //console.log("csvFileNames",csvFileNames);

  const fileDates = csvFileNames.map(fileName => fileName.substring(20,39).replace(' ', 'T').slice(0,13) + ':' + fileName.slice(34,36) + ':'+ fileName.slice(37,39));
  //console.log("fileDates", fileDates);

  

  const dateObjects = fileDates.map(dateString => new Date(dateString));
  //console.log("dateObjects",dateObjects);
  const latestDate = new Date(Math.max(...dateObjects));
  //console.log("latest date is",latestDate);
  latestDateIso = latestDate.toISOString();
  //console.log("l atestDateIso",latestDateIso);
  latestCSV = 'ContainersMovement ('+latestDateIso.slice(0,10)+' '+latestDateIso.slice(11,13)+'-'+latestDateIso.slice(14,16)+'-'+latestDateIso.slice(17,19)+').CSV'
 

  /*const dateObjects = fileDates.map(dateString => new Date(dateString));
   
  */
  // console.log("latestCSV",latestCSV);
  return latestCSV;
}





// Function to fetch and process the CSV file

function tableBuilder(name){
  const tableBody = document.getElementById('csvTable').getElementsByTagName('tbody')[0];
  console.log("tableBody is",tableBody);
  //console.log("What I am trying to fetch:",name);
  fetch(name)
      .then(response => response.text())
      .then(csvData => {
          // Use Papaparse to parse CSV data
          Papa.parse(csvData, {
              header: false,
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (result) => {
                  const data = result.data;
                  // Iterate through rows and columns
                  data.forEach(rowData => {
                      const row = document.createElement('tr');
                      // Iterate through columns
                      for (const key in rowData) {
                          if (rowData.hasOwnProperty(key)) {
                              const cell = document.createElement('td');
                              cell.textContent = rowData[key];
                              row.appendChild(cell);
                          }
                      }
                      
                      tableBody.appendChild(row);
                  });
                  console.log(data);
              },
              error: (error) => {
                  console.error('Error parsing CSV:', error.message);
              }
              
          });
      })
      .catch(error => console.error('Error fetching CSV:', error));
}

/**
* Sorts a HTML table.
*
* @param {HTMLTableElement} table The table to sort
* @param {number} column The index of the column to sort
* @param {boolean} asc Determines if the sorting will be in ascending
*/
function sortTableByColumn(table, column, asc = true) {
const dirModifier = asc ? 1 : -1;
const tBody = table.tBodies[0];
const rows = Array.from(tBody.querySelectorAll("tr"));

// Sort each row
const sortedRows = rows.sort((a, b) => {
  const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
  const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();

  return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
});

// Remove all existing TRs from the table
while (tBody.firstChild) {
  tBody.removeChild(tBody.firstChild);
}

// Re-add the newly sorted rows
tBody.append(...sortedRows);

// Remember how the column is currently sorted
table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-asc", asc);
table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-desc", !asc);
}

document.querySelectorAll(".table-sortable th").forEach(headerCell => {
headerCell.addEventListener("click", () => {
  const tableElement = headerCell.parentElement.parentElement.parentElement;
  const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
  const currentIsAscending = headerCell.classList.contains("th-sort-asc");

  sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
});
});
////////////////////////////////////////////////
function downloadTableAsXLS() {
  // Select the table you want to download
  var table = document.getElementById('csvTable');
  var html = table.outerHTML;

  // Create a fake HTML document with the table embedded
  var htmlDocument = `
    <html>
      <head>
        <meta charset='utf-8'>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // Download as .xls
  var fileName = 'table.xls';
  var blob = new Blob([htmlDocument], {
    type: 'application/vnd.ms-excel'
  });
  
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  
  URL.revokeObjectURL(url);
}