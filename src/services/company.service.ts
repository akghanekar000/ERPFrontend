
import { API, handleResponse, getAuthHeaders } from "./_fetch";

export type InvoiceNumberingSettings = {
  automaticNumbering: boolean;
  savePrefixForFuture: boolean;
  savedPrefix: string;
  usePrefix?: boolean;
};

export type Company = {
  _id?: string;
  companyName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  pinCode: string;

  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;

  invoiceNumbering?: InvoiceNumberingSettings;
};

export type CompanyPayload = {
  companyName: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  pinCode: string;

  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;

  invoiceNumbering?: InvoiceNumberingSettings;
};

export async function getCompany(): Promise<Company | null> {
  const response = await fetch(`${API}/api/companies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response);
}

export async function saveCompany(
  payload: CompanyPayload
): Promise<{ message: string; company: Company }> {
  const response = await fetch(`${API}/api/companies`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(r
                        esponse);
}
