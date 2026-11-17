
import React, { useEffect, useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import {
  getCompany,
  saveCompany,
  type CompanyPayload,
  type InvoiceNumberingSettings,
} from "../../services/company.service";

const emptyNumbering: InvoiceNumberingSettings = {
  automaticNumbering: true,
  savePrefixForFuture: false,
  savedPrefix: "",
};

const emptyCompany: CompanyPayload = {
  companyName: "",
  gstin: "",
  email: "",
  phone: "",
  address: "",
  state: "",
  pinCode: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",
  branch: "",
  invoiceNumbering: emptyNumbering,
};

export default function BusinessInfo() {
  const [form, setForm] = useState<CompanyPayload>(emptyCompany);
  const [numbering, setNumbering] =
    useState<InvoiceNumberingSettings>(emptyNumbering);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompany() {
      try {
        const company = await getCompany();

        if (active && company) {
          setForm({
            companyName: company.companyName || "",
            gstin: company.gstin || "",
            email: company.email || "",
            phone: company.phone || "",
            address: company.address || "",
            state: company.state || "",
            pinCode: company.pinCode || "",
            bankName: company.bankName || "",
            accountHolder: company.accountHolder || "",
            accountNumber: company.accountNumber || "",
            ifscCode: company.ifscCode || "",
            branch: company.branch || "",
            invoiceNumbering: company.invoiceNumbering || emptyNumbering,
          });

          setNumbering({
            automaticNumbering:
              company.invoiceNumbering?.automaticNumbering ?? true,
            savePrefixForFuture:
              company.invoiceNumbering?.savePrefixForFuture ?? false,
            savedPrefix:
              company.invoiceNumbering?.savedPrefix || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load company details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCompany();

    return () => {
      active = false;
    };
  }, []);

  function updateField(field: keyof CompanyPayload, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
    setError("");
  }

  function updateNumbering(
    field: keyof InvoiceNumberingSettings,
    value: string | boolean
  ) {
    setNumbering((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
    setError("");
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (
      numbering.savePrefixForFuture &&
      numbering.savedPrefix.trim().length === 0
    ) {
      setError("Enter a prefix or turn off Save prefix for future invoices.");
      return;
    }

    if (
      numbering.savedPrefix.length > 15 ||
      /\s/.test(numbering.savedPrefix.trim())
    ) {
      setError("Prefix must be 15 characters or fewer and contain no spaces.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await saveCompany({
        ...form,
        companyName: form.companyName.trim(),
        gstin: form.gstin.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
        bankName: form.bankName.trim(),
        accountHolder: form.accountHolder.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
        branch: form.branch.trim(),
        invoiceNumbering: {
          automaticNumbering: numbering.automaticNumbering,
          savePrefixForFuture: numbering.savePrefixForFuture,
          savedPrefix: numbering.savePrefixForFuture
            ? numbering.savedPrefix.trim()
            : "",
        },
      });

      if (result.company) {
        const company = result.company;

        setForm((previous) => ({
          ...previous,
          companyName: company.companyName || "",
          gstin: company.gstin || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          state: company.state || "",
          pinCode: company.pinCode || "",
          bankName: company.bankName || "",
          accountHolder: company.accountHolder || "",
          accountNumber: company.accountNumber || "",
          ifscCode: company.ifscCode || "",
          branch: company.branch || "",
        }));

        setNumbering({
          automaticNumbering:
            company.invoiceNumbering?.automaticNumbering ?? true,
          savePrefixForFuture:
            company.invoiceNumbering?.savePrefixForFuture ?? false,
          savedPrefix:
            company.invoiceNumbering?.savedPrefix || "",
        });
      }

      setMessage("Company, bank and invoice numbering settings saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save company details."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 760 }}>
        <h3>Company Master</h3>
        <p>Loading your company details...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 760 }}>
      <h3>Company Master</h3>

      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Enter the business and bank details used in your billing and invoices.
      </p>

      {error && (
        <p role="alert" style={{ color: "#dc2626", marginBottom: 12 }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "#15803d", marginBottom: 12 }}>
          {message}
        </p>
      )}

      <div className="row">
        <Input
          placeholder="Company Name *"
          value={form.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
        />

        <Input
          placeholder="GSTIN"
          value={form.gstin}
          onChange={(e) => updateField("gstin", e.target.value)}
        />

        <Input
          placeholder="Business Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <Input
          placeholder="Business Phone"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <Input
          placeholder="Business Address"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
        />

        <Input
          placeholder="State"
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
        />

        <Input
          placeholder="PIN Code"
          value={form.pinCode}
          onChange={(e) => updateField("pinCode", e.target.value)}
        />

        <h4 style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
          Bank Details
        </h4>

        <Input
          placeholder="Bank Name"
          value={form.bankName}
          onChange={(e) => updateField("bankName", e.target.value)}
        />

        <Input
          placeholder="Account Holder Name"
          value={form.accountHolder}
          onChange={(e) => updateField("accountHolder", e.target.value)}
        />

        <Input
          placeholder="Account Number"
          value={form.accountNumber}
          onChange={(e) => updateField("accountNumber", e.target.value)}
        />

        <Input
          placeholder="IFSC Code"
          value={form.ifscCode}
          onChange={(e) => updateField("ifscCode", e.target.value)}
        />

        <Input
          placeholder="Branch"
          value={form.branch}
          onChange={(e) => updateField("branch", e.target.value)}
        />

        <h4 style={{ gridColumn: "1 / -1", marginBottom: 0 }}>
          Invoice Number Settings
        </h4>

        <label style={{ gridColumn: "1 / -1" }}>
          <input
            type="checkbox"
            checked={numbering.automaticNumbering}
            onChange={(e) =>
              updateNumbering("automaticNumbering", e.target.checked)
            }
          />{" "}
          Enable automatic invoice numbering
        </label>

        <p style={{ gridColumn: "1 / -1", color: "#64748b", margin: 0 }}>
          When disabled, you must enter the invoice number manually while
          creating an invoice.
        </p>

        <label style={{ gridColumn: "1 / -1" }}>
          <input
            type="checkbox"
            checked={numbering.savePrefixForFuture}
            onChange={(e) =>
              updateNumbering("savePrefixForFuture", e.target.checked)
            }
          />{" "}
          Save prefix for future invoices
        </label>

        {numbering.savePrefixForFuture && (
          <div style={{ gridColumn: "1 / -1" }}>
            <Input
              placeholder="Invoice prefix, e.g. AKT-"
              value={numbering.savedPrefix}
              onChange={(e) =>
                updateNumbering("savedPrefix", e.target.value)
              }
            />
            <p style={{ color: "#64748b", fontSize: 12 }}>
              This prefix will be suggested when creating invoices. It will
              not be applied automatically.
            </p>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Company Details"}
        </Button>
      </div>
    </div>
  );
}
