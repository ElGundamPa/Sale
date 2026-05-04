/**
 * Vegas Sales — doGet
 * Devuelve { teams, newSales } para el Edge Function google-sheets-proxy.
 *
 * Hoja "Total":
 *   Mesa 1 → filas 3-8,  total real en J3
 *   Mesa 2 → filas 11-17, total real en J4
 *   Col B = nombre agente, Col E = total acumulado del agente
 *
 * Hoja "Hoja 2":
 *   Col C = agente que cerró
 *   Col K = fecha de entrada (la fila se considera venta cerrada cuando K tiene valor)
 *   Col L = monto
 */

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return jsonResponse({ error: "Script no vinculado a un Sheet" });
    }

    var sheetTotal = ss.getSheetByName("Total");
    var sheet2 = ss.getSheetByName("Hoja 2");
    if (!sheetTotal) return jsonResponse({ error: "Falta hoja 'Total'" });
    if (!sheet2) return jsonResponse({ error: "Falta hoja 'Hoja 2'" });

    var dataTotal = sheetTotal.getDataRange().getValues();
    var data2 = sheet2.getDataRange().getValues();

    var teams = processTeamsData(dataTotal);
    var newSales = processNewSales(data2);

    return jsonResponse({ teams: teams, newSales: newSales });
  } catch (e) {
    return jsonResponse({ error: e.toString(), stack: e.stack || null });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function processTeamsData(data) {
  // Loop usa `i < endRow` con i = startRow-1 (0-indexed).
  // endRow es EXCLUSIVO: la última fila leída es endRow-1 (1-indexed: endRow).
  // Mesa 1 → filas 3-9 (7 agentes), endRow = 9 → loop i=2..8 → rows 3..9 ✓
  // Mesa 2 → filas 11-17 (7 agentes), endRow = 17 → loop i=10..16 → rows 11..17 ✓
  // Si agregás/quitás filas en la pizarra, ajustá startRow/endRow.
  var teamRanges = [
    { name: "Mesa 1", startRow: 3,  endRow: 9,  totalCell: { row: 2, col: 9 } },
    { name: "Mesa 2", startRow: 11, endRow: 17, totalCell: { row: 3, col: 9 } }
  ];

  // Defensa contra filas de subtotal/encabezado capturadas por error.
  var EXCLUDED_NAMES = ["total", "subtotal", "totales", "agentes", "agente", "nombre"];

  var teams = [];

  for (var t = 0; t < teamRanges.length; t++) {
    var teamConfig = teamRanges[t];
    var team = {
      id: teamConfig.name.toLowerCase().replace(/\s+/g, '-'),
      name: teamConfig.name,
      goal: 50000,
      total_real: 0,
      agents: []
    };

    if (
      data[teamConfig.totalCell.row] &&
      data[teamConfig.totalCell.row][teamConfig.totalCell.col] !== undefined
    ) {
      team.total_real =
        parseFloat(data[teamConfig.totalCell.row][teamConfig.totalCell.col]) || 0;
    }

    for (
      var i = teamConfig.startRow - 1;
      i < teamConfig.endRow && i < data.length;
      i++
    ) {
      var row = data[i];
      var agentName = row[1]; // Col B
      var sales = parseFloat(row[4]) || 0; // Col E

      var nameStr = agentName ? agentName.toString().trim() : '';
      if (nameStr !== '' && EXCLUDED_NAMES.indexOf(nameStr.toLowerCase()) === -1) {
        team.agents.push({
          id: agentName.toString().toLowerCase().replace(/\s+/g, '-') + '-' + i,
          name: agentName.toString().trim(),
          avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
            encodeURIComponent(agentName),
          sales: sales,
          teamId: team.id
        });
      }
    }

    if (team.agents.length > 0) {
      teams.push(team);
    }
  }

  return teams;
}

function processNewSales(data) {
  var sales = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var agentName = row[2];               // Col C
    var entryDate = row[10];              // Col K
    var value = parseFloat(row[11]) || 0; // Col L

    if (agentName && entryDate && value > 0) {
      sales.push({
        agentName: agentName.toString().trim(),
        entryDate: entryDate.toString(),
        value: value
      });
    }
  }

  return sales;
}

/**
 * Función de diagnóstico — corré esta primero para verificar que todo está bien.
 * Editor → dropdown de funciones → "test" → ▶ Ejecutar.
 * Después abrí el Registro de ejecución y mirá los console.log.
 */
function test() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log("Spreadsheet name:", ss ? ss.getName() : "NULL");

  if (!ss) {
    console.log("ERROR: el script no está vinculado a un Sheet.");
    return;
  }

  var sheetNames = ss.getSheets().map(function(s) { return s.getName(); });
  console.log("Hojas existentes:", JSON.stringify(sheetNames));

  console.log("Hoja 'Total':", ss.getSheetByName("Total") ? "OK" : "NO ENCONTRADA");
  console.log("Hoja 'Hoja 2':", ss.getSheetByName("Hoja 2") ? "OK" : "NO ENCONTRADA");

  // Ejecutar el doGet completo y mostrar resultado.
  var result = doGet();
  console.log("doGet output:", result.getContent().substring(0, 800));
}
