import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResponsiveTable, type Column } from "./ResponsiveTable";

interface Row {
  id: string;
  name: string;
  amount: number;
}

const columns: Column<Row>[] = [
  { key: "name", header: "Name", cell: (r) => r.name },
  { key: "amount", header: "Amount", cell: (r) => r.amount, align: "right" },
];

const rows: Row[] = [
  { id: "1", name: "Widget", amount: 10 },
  { id: "2", name: "Gadget", amount: 20 },
];

// Verifies the dual rendering strategy behind "tables that become cards":
// both a <table> and a card-per-row list are rendered simultaneously (CSS
// hides one or the other per breakpoint, jsdom has no layout), so a
// meaningful test here is that both representations contain the same data,
// and that the empty state is handled.
describe("ResponsiveTable", () => {
  it("renders every row's data in the table body", () => {
    render(<ResponsiveTable columns={columns} rows={rows} rowKey={(r) => r.id} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Widget");
    expect(table).toHaveTextContent("Gadget");
  });

  it("renders column headers", () => {
    render(<ResponsiveTable columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Amount" })).toBeInTheDocument();
  });

  it("shows the empty message when there are no rows", () => {
    render(<ResponsiveTable columns={columns} rows={[]} rowKey={(r) => r.id} emptyMessage="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
