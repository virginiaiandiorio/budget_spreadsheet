function onEdit(e) {
  addToCategory(e);
}

function addToCategory(e) {
  const sheet = e.range.getSheet();
  const editedCell = e.range;
  const inputCell = editedCell.getA1Notation();

  //This maps a certain input cell to the general letter of the output storage
  const accountMap = {
    "C1": "C", // HSBC account data → Column C
    "D1": "D"  // Monzo account → Column D
  };

  if (!(inputCell in accountMap)) return;

  const input = e.value;
  if (!input) return;

  const parts = input.trim().split(" ");
  if (parts.length < 2) {
    return showTempMessage(editedCell, "Format: category amount");
  }

  const keyword = parts[0].toLowerCase();
  const amount = parseFloat(parts[1]);
  if (isNaN(amount)) {
    return showTempMessage(editedCell, "Invalid number");
  }

  // Shared category map (row-based, not column-specific)
  const categoryMap = {
    "bank transfer in":  { row: 8,  aliases: ["transferin", "ti"] },
    "wage":              { row: 9,  aliases: ["salary", "paycheck"] },
    "payment":           { row: 10, aliases: ["income", "deposit"] },
    "bank transfer":     { row: 12, aliases: ["transferout", "to"] },
    "rent":              { row: 13, aliases: ["rent"] },
    "electricity dd":    { row: 14, aliases: ["electricity", "power", "energy"] },
    "internet":          { row: 15, aliases: ["wifi", "broadband"] },
    "water":             { row: 16, aliases: ["uu", "water"] },
    "council tax":       { row: 17, aliases: ["tax", "ct"] },
    "phone":             { row: 18, aliases: ["ee", "mobile"] },
    "spotify":           { row: 19, aliases: ["music"] },
    "gym":               { row: 20, aliases: ["pool", "exercise"] },
    "doctor/dentist":    { row: 21, aliases: ["doctor", "dentist", "healthcare"] },
    "medicine/drugs":    { row: 22, aliases: ["pharmacy", "medication"] },
    "toiletry care":     { row: 23, aliases: ["toiletries", "selfcare"] },
    "home groceries":    { row: 24, aliases: ["groceries", "food", "shop"] },
    "eating out":        { row: 25, aliases: ["restaurant", "takeaway", "foodout"] },
    "recreational":      { row: 26, aliases: ["entertainment", "fun"] },
    "transportation":    { row: 27, aliases: ["transport", "bus", "train", "tram"] },
    "gifts":             { row: 28, aliases: ["present", "birthday"] },
    "vacation/travel":   { row: 29, aliases: ["travel", "holiday", "trip"] },
    "house decor":       { row: 30, aliases: ["furniture", "decor"] },
    "other":             { row: 31, aliases: ["misc", "miscellaneous", "random"] }
  };

  // Clear input in input cell to add more
  editedCell.clearContent();

  const matchKey = Object.keys(categoryMap).find(k => {
    if (k.toLowerCase() === keyword) return true;        // exact match on category name
    const aliases = categoryMap[k].aliases || [];
    return aliases.some(a => a.toLowerCase() === keyword); // exact match on alias
  });

  if (!matchKey) {
    return showTempMessage(editedCell, "Unknown category");
  }

  // Determine target cell based on account column and category row
  const targetColLetter = accountMap[inputCell];
  const targetCell = sheet.getRange(`${targetColLetter}${categoryMap[matchKey].row}`);


  const current = targetCell.getValue() || 0;
  targetCell.setValue(current + amount);



  // Flash highlight because it's cool
  targetCell.setBackground("#fff176");
  SpreadsheetApp.flush();
  Utilities.sleep(1000);
  targetCell.setBackground(null);
}

function showTempMessage(cell, message) {
  cell.setValue(message);
  SpreadsheetApp.flush();
  Utilities.sleep(500);
  cell.clearContent();
}
