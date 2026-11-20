const { toCsv } = require("./csv.util");

const COLUMNS = [
  { header: "Name", value: (row) => row.name },
  { header: "Amount", value: (row) => row.amount },
];

describe("toCsv", () => {
  it("writes a header and one line per row with a BOM and Windows line ends", () => {
    expect(toCsv(COLUMNS, [{ name: "Asha", amount: "1180.00" }])).toBe("﻿Name,Amount\r\nAsha,1180.00\r\n");
  });

  it("writes only the header for no rows", () => {
    expect(toCsv(COLUMNS, [])).toBe("﻿Name,Amount\r\n");
  });

  it("quotes cells with commas, quotes and line breaks", () => {
    const csv = toCsv(COLUMNS, [{ name: 'Rao, "Asha"\nSurat', amount: 1 }]);

    expect(csv).toContain('"Rao, ""Asha""\nSurat",1');
  });

  it("leaves empty values blank", () => {
    expect(toCsv(COLUMNS, [{ name: null, amount: undefined }])).toContain("\r\n,\r\n");
  });

  it.each(["=SUM(A1:A9)", "+91 98765", "-5", "@cmd", "\tTab"])("neutralises %j so a spreadsheet does not run it", (text) => {
    expect(toCsv(COLUMNS, [{ name: text, amount: 1 }])).toContain(`'${text}`);
  });
});
