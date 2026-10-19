
import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import type { CSSProperties } from 'react';
import type { InvoiceTemplateData } from './DefaultInvoiceTemplate';

type Props = {
  file: File;
  data: InvoiceTemplateData;
  onError: (message: string) => void;
};

type MergeInfo = {
  rowSpan: number;
  colSpan: number;
};

function columnNumber(letters: string) {
  let number = 0;

  for (const letter of letters) {
    number = number * 26 + letter.charCodeAt(0) - 64;
  }

  return number;
}

function colour(value?: string) {
  if (!value) return undefined;

  const hex = value.length >= 6 ? value.slice(-6) : value;

  return `#${hex}`;
}

function cellStyle(cell: ExcelJS.Cell): CSSProperties {
  const style = cell.style;
  const font = style.font;
  const alignment = style.alignment;
  const fill = style.fill as ExcelJS.FillPattern | undefined;
  const borders = style.border;

  const css: CSSProperties = {
    padding: '5px',
    verticalAlign: 'middle',
    whiteSpace: alignment?.wrapText ? 'pre-wrap' : 'pre-wrap',
    textAlign:
      alignment?.horizontal === 'center' ||
      alignment?.horizontal === 'right' ||
      alignment?.horizontal === 'left'
        ? alignment.horizontal
        : 'left',
    fontWeight: font?.bold ? 'bold' : 'normal',
    fontStyle: font?.italic ? 'italic' : 'normal',
    fontSize: font?.size ? `${font.size}pt` : '10pt',
    fontFamily: font?.name || 'Arial',
    color: colour(font?.color?.argb) || '#111111',
  };

  if (fill && fill.type === 'pattern' && fill.fgColor?.argb) {
    css.backgroundColor = colour(fill.fgColor.argb);
  }

  const borderCss = (side?: ExcelJS.Border) => {
    if (!side || !side.style) return undefined;

    const borderStyle =
      side.style === 'double'
        ? 'double'
        : side.style === 'dotted'
          ? 'dotted'
          : side.style === 'dashed'
            ? 'dashed'
            : 'solid';

    return `${side.style === 'thick' ? 3 : side.style === 'medium' ? 2 : 1}px ${borderStyle} ${colour(side.color?.argb) || '#222222'}`;
  };

  css.borderTop = borderCss(borders?.top);
  css.borderBottom = borderCss(borders?.bottom);
  css.borderLeft = borderCss(borders?.left);
  css.borderRight = borderCss(borders?.right);

  return css;
}

function displayCell(cell: ExcelJS.Cell) {
  const value = cell.value;

  if (value === null || value === undefined) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return cell.text || '';
}

function money(value: number) {
  return Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string) {
  if (!value) return new Date().toLocaleDateString('en-IN');

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN');
}

function makeValues(data: InvoiceTemplateData) {
  return {
    companyName: data.company?.companyName || '',
    companyGstin: data.company?.gstin || '',
    companyAddress: data.company?.address || '',
    companyState: data.company?.state || '',
    companyPinCode: data.company?.pinCode || '',
    companyPhone: data.company?.phone || '',
    companyEmail: data.company?.email || '',

    customerName: data.customer?.name || '',
    customerGstin: data.customer?.gstin || data.customer?.gst || '',
    customerAddress: data.customer?.address || '',
    customerState: data.customer?.state || '',
    customerPhone: data.customer?.phone || '',
    customerEmail: data.customer?.email || '',

    invoiceNumber: data.invoiceNumber || '',
    invoiceDate: formatDate(data.date),
    taxableTotal: money(data.taxableTotal),
    taxTotal: money(data.taxTotal),
    roundOff: (
      Math.round(Number(data.grandTotal || 0)) -
      Number(data.grandTotal || 0)
    ).toFixed(2),
    grandTotal: money(Math.round(Number(data.grandTotal || 0))),
    notes: data.notes || '',
  };
}

function substitute(
  text: string,
  values: Record<string, string>,
  item?: InvoiceTemplateData['items'][number],
) {
  const itemValues: Record<string, string> = item
    ? {
        'item.name': String(item.name || ''),
        'item.qty': String(item.qty ?? ''),
        'item.price': money(item.price),
        'item.gstRate': `${item.gstRate}%`,
        'item.taxableAmount': money(item.taxableAmount),
        'item.taxAmount': money(item.taxAmount),
        'item.total': money(item.total),
      }
    : {
        'item.name': '',
        'item.qty': '',
        'item.price': '',
        'item.gstRate': '',
        'item.taxableAmount': '',
        'item.taxAmount': '',
        'item.total': '',
      };

  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key: string) => {
    const name = key.trim();

    if (name in itemValues) return itemValues[name];
    if (name in values) return values[name];

    return '';
  });
}

export default function CustomInvoiceTemplate({
  file,
  data,
  onError,
}: Props) {
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWorkbook() {
      setLoading(true);
      setWorkbook(null);

      try {
        const nextWorkbook = new ExcelJS.Workbook();
        const bytes = await file.arrayBuffer();

        await nextWorkbook.xlsx.load(bytes);

        const worksheet = nextWorkbook.worksheets[0];

        if (!worksheet) {
          throw new Error('The Excel file has no worksheet.');
        }

        const itemRowNumber = (() => {
          for (let row = 1; row <= worksheet.rowCount; row += 1) {
            for (let col = 1; col <= worksheet.columnCount; col += 1) {
              const value = worksheet.getCell(row, col).value;

              if (
                typeof value === 'string' &&
                /\{\{\s*item\./.test(value)
              ) {
                return row;
              }
            }
          }

          return 0;
        })();

        if (itemRowNumber > 0 && data.items.length > 1) {
          const templateRow = worksheet.getRow(itemRowNumber);
          const columnCount = worksheet.columnCount;
          const templateValues: unknown[] = [];
          const templateStyles: ExcelJS.Style[] = [];

          for (let col = 1; col <= columnCount; col += 1) {
            const cell = templateRow.getCell(col);
            templateValues[col] = cell.value;
            templateStyles[col] = JSON.parse(
              JSON.stringify(cell.style),
            ) as ExcelJS.Style;
          }

          const templateHeight = templateRow.height;

          for (let itemIndex = 1; itemIndex < data.items.length; itemIndex += 1) {
            const inserted = worksheet.insertRow(
              itemRowNumber + itemIndex,
              [],
              'i',
            );

            inserted.height = templateHeight;

            for (let col = 1; col <= columnCount; col += 1) {
              const cell = inserted.getCell(col);
              cell.value = templateValues[col];
              cell.style = JSON.parse(
                JSON.stringify(templateStyles[col] || {}),
              ) as ExcelJS.Style;
            }
          }
        }

        const values = makeValues(data);

        for (let row = 1; row <= worksheet.rowCount; row += 1) {
          const rowItemIndex = itemRowNumber > 0
            ? row - itemRowNumber
            : -1;

          const rowItem =
            rowItemIndex >= 0 && rowItemIndex < data.items.length
              ? data.items[rowItemIndex]
              : undefined;

          for (let col = 1; col <= worksheet.columnCount; col += 1) {
            const cell = worksheet.getCell(row, col);

            if (typeof cell.value === 'string') {
              cell.value = substitute(cell.value, values, rowItem);
            }
          }
        }

        if (active) setWorkbook(nextWorkbook);
      } catch (error) {
        if (active) {
          onError(
            error instanceof Error
              ? error.message
              : 'Could not read this Excel template.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWorkbook();

    return () => {
      active = false;
    };
  }, [file, data, onError]);

  if (loading) {
    return <p className="p-6 text-center">Loading Excel template…</p>;
  }

  const worksheet = workbook?.worksheets[0];

  if (!worksheet) {
    return (
      <p className="p-6 text-center text-red-700">
        The Excel template could not be displayed.
      </p>
    );
  }

  const merges: Record<string, MergeInfo> = {};

  for (const range of worksheet.model.merges || []) {
    const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i.exec(range);
    if (!match) continue;

    const startCol = columnNumber(match[1].toUpperCase());
    const startRow = Number(match[2]);
    const endCol = columnNumber(match[3].toUpperCase());
    const endRow = Number(match[4]);

    merges[`${startRow}:${startCol}`] = {
      rowSpan: endRow - startRow + 1,
      colSpan: endCol - startCol + 1,
    };
  }

  return (
    <div className="custom-excel-sheet overflow-x-auto bg-white p-3 text-black sm:p-6">
      <table className="border-collapse text-left">
        <colgroup>
          {Array.from(
            { length: worksheet.columnCount },
            (_value, index) => {
              const width = worksheet.getColumn(index + 1).width || 10;

              return (
                <col
                  key={index}
                  style={{ width: `${Math.max(35, width * 7)}px` }}
                />
              );
            },
          )}
        </colgroup>

        <tbody>
          {Array.from(
            { length: worksheet.rowCount },
            (_value, rowIndex) => {
              const rowNumber = rowIndex + 1;
              const row = worksheet.getRow(rowNumber);

              return (
                <tr key={rowNumber}>
                  {Array.from(
                    { length: worksheet.columnCount },
                    (_cell, colIndex) => {
                      const colNumber = colIndex + 1;
                      const cell = worksheet.getCell(rowNumber, colNumber);

                      if (
                        cell.isMerged &&
                        cell.master.address !== cell.address
                      ) {
                        return null;
                      }

                      const merge = merges[`${rowNumber}:${colNumber}`];

                      return (
                        <td
                          key={colNumber}
                          rowSpan={merge?.rowSpan}
                          colSpan={merge?.colSpan}
                          style={{
                            ...cellStyle(cell),
                            minWidth: 35,
                            height: row.height
                              ? `${row.height * 1.33}px`
                              : undefined,
                          }}
                        >
                          {displayCell(cell)}
                        </td>
                      );
                    },
                  )}
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

