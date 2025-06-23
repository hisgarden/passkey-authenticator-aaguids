'use strict';

function imageTag(src) {
  return src ? "<img src='" + src + "'/>" : "";
}

function $(query) {
  return document.querySelector(query);
}

function $toggle(query, show) {
  return $(query).style.display = (show ? 'block' : 'none');
}

function $$(query) {
  return document.querySelectorAll(query);
}

function appendRow(table, html) {
  const row = document.createElement("tr");
  row.innerHTML = html;
  table.appendChild(row);
}

document.onreadystatechange = async () => {
  if (document.readyState == "complete") {

    try {
      let file, switchJsonUrl, switchJsonText;
      if (location.search === "?combined") {
        file = "combined_aaguid.json";
        switchJsonUrl = ".";
        switchJsonText = "Exclude MDS authenticators"
      } else {
        file = "aaguid.json";
        switchJsonUrl = "./?combined";
        switchJsonText = "Include MDS authenticators"
      } 
      $("#switch-json").setAttribute("href", switchJsonUrl);
      $("#switch-json").innerText = switchJsonText;
      
      const response = await fetch("../" + file);

      const json = await response.json();

      $toggle("#loading", false);
      $toggle("#main", true);
      const table = $("#aaguids");
      appendRow(table, `
      <tr>
        <th>AAGUID <br/>
          <input id="filter-aaguid" type="text" placeholder="Filter by AAGUID..."/>
          <a id="clear-filter-aaguid" href="#" title="clear">X</a>
        </th>
        <th>Name <br/> 
          <input id="filter-name" type="text" placeholder="Filter by name..."/>
          <a id="clear-filter-name" href="#" title="clear">X</a>
        </th>
        <th>Icon light</th>
        <th class="dark">Icon dark</th>
      </tr>
      `);

      for (const aaguid in json) {
        if (Object.hasOwnProperty.call(json, aaguid)) {
          appendRow(table, `
          <tr>
            <td class="aaguid">${aaguid}</td>
            <td class="name">${json[aaguid].name}</td>
            <td class="icon">${imageTag(json[aaguid].icon_light)}</td>
            <td class="icon dark">${imageTag(json[aaguid].icon_dark)}</td>
          </tr>
          `);
        }
      }

      function applyFilters() {
        const nameFilter = $("#filter-name")?.value?.toLowerCase() || "";
        const aaguidFilter = $("#filter-aaguid")?.value?.toLowerCase() || "";
        
        $$("#aaguids tr").forEach( (row) => {
          // Skip the header row (it has th elements, not td elements)
          if (row.querySelector("th")) {
            return;
          }
          
          const nameCell = row.querySelector("td.name");
          const aaguidCell = row.querySelector("td.aaguid");
          
          if (!nameCell || !aaguidCell) {
            return;
          }
          
          const name = nameCell.innerText?.toLowerCase() || "";
          const aaguid = aaguidCell.innerText?.toLowerCase() || "";
          
          const nameMatch = !nameFilter || name.indexOf(nameFilter) >= 0;
          const aaguidMatch = !aaguidFilter || aaguid.indexOf(aaguidFilter) >= 0;
          const show = nameMatch && aaguidMatch;
          
          row.style.display = (show ? 'table-row' : 'none');
        });
      }

      // Add event listeners for both keyup and input events for better responsiveness
      $("#filter-name").addEventListener("keyup", applyFilters);
      $("#filter-name").addEventListener("input", applyFilters);
      $("#filter-aaguid").addEventListener("keyup", applyFilters);
      $("#filter-aaguid").addEventListener("input", applyFilters);

      $("#clear-filter-name").addEventListener("click", (event) => {
        $("#filter-name").value = "";
        applyFilters();
        event.preventDefault();
      });

      $("#clear-filter-aaguid").addEventListener("click", (event) => {
        $("#filter-aaguid").value = "";
        applyFilters();
        event.preventDefault();
      });

    } catch (err) {
      $toggle("#loading-error", true);
      console.error(err);
    }
  }
}
