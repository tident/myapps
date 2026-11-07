"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type InvoiceItem = {
  item_code: string;
  item_name: string;
  price: number;
  quantity: number;
  amount: number;
};

type InvoiceData = {
  invoice_id: string;
  invoice_number: string;
  billed_to: string;
  date: string;
  sub_total: string;
  total_amount: string;
  items_json: string;
};

type Settings = {
  bank: string;
  account_name: string;
  account_number: string;
  wa_number: string;
  ig_handle: string;
};

const ITEMS_PER_PAGE = 10;

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  async function fetchInvoiceData() {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const invoiceRes = await fetch(`${backendUrl}?action=getInvoices`, { method: "GET" });
      const invoiceResult = await invoiceRes.json();
      
      if (invoiceResult.status === "success") {
        const rows = invoiceResult.data.slice(1);
        const found = rows.find((row: any) => row[0].toString() === invoiceId);
        
        if (found) {
          const invData = {
            invoice_id: found[0],
            invoice_number: found[1],
            billed_to: found[2],
            date: found[3],
            sub_total: found[4],
            total_amount: found[5],
            items_json: found[6],
          };
          setInvoice(invData);
          setItems(JSON.parse(invData.items_json));
        }
      }

      const settingsRes = await fetch(`${backendUrl}?action=getInvoiceSettings`, { method: "GET" });
      const settingsResult = await settingsRes.json();
      
      if (settingsResult.status === "success") {
        setSettings(settingsResult.data);
      }

    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatRupiah = (angka: number) => {
    return `Rp ${new Intl.NumberFormat("id-ID").format(angka)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // === FUNGSI RENDER HALAMAN (DIPAKAI UNTUK WEB DAN PDF) ===
  const renderPage = (pageIndex: number, pageItems: InvoiceItem[], isLastPage: boolean) => {
    const isFirstPage = pageIndex === 0;

    return (
      <div 
        key={pageIndex}
        className="invoice-page" 
        style={{ 
          width: "800px", 
          height: "1000px",
          padding: "50px 60px", 
          backgroundColor: "#ffffff",
          position: "relative",
          boxSizing: "border-box",
          fontFamily: "'Inter', 'Montserrat', Arial, sans-serif",
          color: "#000000",
          display: "flex",
          flexDirection: "column",
          marginBottom: "20px" 
        }}
      >
        <div style={{ flex: 1 }}>
          {isFirstPage ? (
            <>
              <div style={{ position: "absolute", top: "40px", left: "40px" }}>
                <img src="/rasarasalogo.png" alt="Logo" style={{ width: "200px", height: "auto" }} />
              </div>

              <div style={{ textAlign: "right", marginBottom: "35px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "1.5px" }}>
                  <span style={{ color: "#2b39b0" }}>RASARASA </span>
                  <span style={{ color: "#e88bb9" }}>BYRANIA</span>
                </h1>
                
                {/* INSTAGRAM (MENGGUNAKAN GAMBAR) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px", marginBottom: "30px" }}>
                  <img 
                    src="/logoig.png" 
                    alt="IG" 
                    style={{ width: "16px", height: "16px", display: "block", marginTop: "2px" }} 
                  />
                  <span style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "1px", lineHeight: "1" }}>
                    {settings?.ig_handle || "@rasarasabyrania"}
                  </span>
                </div>

                <div>
                  <h2 style={{ fontSize: "36px", fontWeight: "900", margin: 0, letterSpacing: "3px", lineHeight: "1.1" }}>INVOICE</h2>
                  <p style={{ fontSize: "26px", fontWeight: "800", margin: "4px 0 0 0", letterSpacing: "1px" }}>#{invoice?.invoice_number.replace("#", "")}</p>
                </div>
              </div>

              <div style={{ marginBottom: "25px", fontSize: "15px", fontWeight: "600" }}>
                <div style={{ display: "flex", marginBottom: "10px", alignItems: "center" }}>
                  <span style={{ width: "130px", fontWeight: "900", letterSpacing: "1.5px" }}>BILLED TO</span>
                  <span style={{ width: "20px" }}>:</span>
                  <span style={{ fontWeight: "700" }}>{invoice?.billed_to}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "130px", fontWeight: "900", letterSpacing: "1.5px" }}>DATE</span>
                  <span style={{ width: "20px" }}>:</span>
                  <span style={{ fontWeight: "700" }}>{formatDate(invoice?.date || "")}</span>
                </div>
              </div>
            </>
          ) : (
             <div style={{ height: "50px" }}></div>
          )}

          <div style={{ borderTop: "1.5px solid #000000" }}></div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ borderBottom: "3px solid #000000" }}>
                <th style={{ padding: "14px 0", textAlign: "left", fontSize: "15px", fontWeight: "900", letterSpacing: "1.5px", width: "35%" }}>ITEM</th>
                <th style={{ padding: "14px 0", textAlign: "right", fontSize: "15px", fontWeight: "900", letterSpacing: "1.5px", width: "20%" }}>PRICE</th>
                <th style={{ padding: "14px 0", textAlign: "center", fontSize: "15px", fontWeight: "900", letterSpacing: "1.5px", width: "20%" }}>QUANTITY</th>
                <th style={{ padding: "14px 0", textAlign: "right", fontSize: "15px", fontWeight: "900", letterSpacing: "1.5px", width: "25%" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #4a4a4a" }}>
                  <td style={{ padding: "14px 0", fontSize: "15px", color: "#333333", fontWeight: "400", wordWrap: "break-word" }}>{item.item_name}</td>
                  <td style={{ padding: "14px 0", fontSize: "15px", color: "#4b5563", textAlign: "right", fontWeight: "300" }}>{formatRupiah(item.price)}</td>
                  <td style={{ padding: "14px 0", fontSize: "15px", color: "#4b5563", textAlign: "center", fontWeight: "300" }}>{item.quantity}</td>
                  <td style={{ padding: "14px 0", fontSize: "15px", color: "#4b5563", textAlign: "right", fontWeight: "300" }}>{formatRupiah(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {isLastPage && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: "40px" }}>
              <div style={{ width: "350px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", fontSize: "16px", color: "#4b5563", fontWeight: "300" }}>
                  <span>Sub-Total</span>
                  <span>{formatRupiah(Number(invoice?.sub_total))}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #000000", paddingTop: "12px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "2px" }}>TOTAL</span>
                  <span style={{ fontSize: "20px", fontWeight: "900" }}>{formatRupiah(Number(invoice?.total_amount))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ABSOLUTE (SELALU DI BAWAH) */}
        {isLastPage && (
          <div style={{ position: "absolute", bottom: "0px", left: "60px", right: "60px", paddingBottom: "40px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "900", margin: "0 0 16px 0", letterSpacing: "2px" }}>PAY TO:</h3>
            <div style={{ fontSize: "15px", fontWeight: "700" }}>
              <div style={{ display: "flex", marginBottom: "8px" }}><span style={{ width: "160px" }}>Bank</span><span>{settings?.bank || "BCA"}</span></div>
              <div style={{ display: "flex", marginBottom: "8px" }}><span style={{ width: "160px" }}>Account Name</span><span>{settings?.account_name || "Rania Kemala Ayu"}</span></div>
              <div style={{ display: "flex" }}><span style={{ width: "160px" }}>Account Number</span><span>{settings?.account_number || "5271385456"}</span></div>
            </div>
            <div style={{ borderTop: "3px solid #000000", margin: "16px 0 12px 0" }}></div>
            
            {/* WHATSAPP (MENGGUNAKAN GAMBAR) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
              <img 
                src="/logowa.png" 
                alt="WA" 
                style={{ width: "22px", height: "22px", display: "block" }} 
              />
              <span style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "1px", lineHeight: "1" }}>
                {settings?.wa_number || "0817-0765-594"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  async function handleDownloadPDF() {
    if (!invoice) return;
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const pages = [];
      for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        pages.push(items.slice(i, i + ITEMS_PER_PAGE));
      }

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      for (let i = 0; i < pages.length; i++) {
        const pageItems = pages[i];
        const isLastPage = i === pages.length - 1;
        
        const tempDiv = document.createElement("div");
        tempDiv.style.width = "800px";
        
        const htmlString = `
          <div style="width: 800px; height: 1000px; padding: 50px 60px; background-color: #ffffff; position: relative; box-sizing: border-box; font-family: 'Inter', 'Montserrat', Arial, sans-serif; color: #000000; display: flex; flex-direction: column;">
            <div style="flex: 1;">
              ${i === 0 ? `
                <div style="position: absolute; top: 40px; left: 40px;"><img src="/rasarasalogo.png" style="width: 200px; height: auto;" /></div>
                <div style="text-align: right; margin-bottom: 35px;">
                  <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 4px 0; letter-spacing: 1.5px;"><span style="color: #2b39b0;">RASARASA </span><span style="color: #e88bb9;">BYRANIA</span></h1>
                  
                  <!-- INSTAGRAM (MENGGUNAKAN GAMBAR) -->
                  <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px; margin-bottom: 30px;">
                    <img src="/logoig.png" style="width: 16px; height: 16px; display: block; margin-top: 17px;" />
                    <span style="font-size: 14px; font-weight: 600; letter-spacing: 1px; line-height: 1;">${settings?.ig_handle || "@rasarasabyrania"}</span>
                  </div>

                  <div><h2 style="font-size: 36px; font-weight: 900; margin: 0; letter-spacing: 3px; line-height: 1.1;">INVOICE</h2><p style="font-size: 26px; font-weight: 800; margin: 4px 0 0 0; letter-spacing: 1px;">#${invoice.invoice_number.replace("#", "")}</p></div>
                </div>
                <div style="margin-bottom: 25px; font-size: 15px; font-weight: 600;">
                  <div style="display: flex; margin-bottom: 10px; align-items: center;"><span style="width: 130px; font-weight: 900; letter-spacing: 1.5px;">BILLED TO</span><span style="width: 20px;">:</span><span style="font-weight: 700;">${invoice.billed_to}</span></div>
                  <div style="display: flex; align-items: center;"><span style="width: 130px; font-weight: 900; letter-spacing: 1.5px;">DATE</span><span style="width: 20px;">:</span><span style="font-weight: 700;">${formatDate(invoice.date)}</span></div>
                </div>
              ` : '<div style="height: 50px;"></div>'}
              <div style="border-top: 1.5px solid #000000;"></div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed;">
                <thead>
                  <tr style="border-bottom: 3px solid #000000;">
                    <th style="padding: 14px 0; text-align: left; font-size: 15px; font-weight: 900; letter-spacing: 1.5px; width: 35%;">ITEM</th>
                    <th style="padding: 14px 0; text-align: right; font-size: 15px; font-weight: 900; letter-spacing: 1.5px; width: 20%;">PRICE</th>
                    <th style="padding: 14px 0; text-align: center; font-size: 15px; font-weight: 900; letter-spacing: 1.5px; width: 20%;">QUANTITY</th>
                    <th style="padding: 14px 0; text-align: right; font-size: 15px; font-weight: 900; letter-spacing: 1.5px; width: 25%;">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageItems.map(item => `
                    <tr style="border-bottom: 1px solid #4a4a4a;">
                      <td style="padding: 14px 0; font-size: 15px; color: #333333; font-weight: 400; word-wrap: break-word;">${item.item_name}</td>
                      <td style="padding: 14px 0; font-size: 15px; color: #4b5563; text-align: right; font-weight: 300;">${formatRupiah(item.price)}</td>
                      <td style="padding: 14px 0; font-size: 15px; color: #4b5563; text-align: center; font-weight: 300;">${item.quantity}</td>
                      <td style="padding: 14px 0; font-size: 15px; color: #4b5563; text-align: right; font-weight: 300;">${formatRupiah(item.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${isLastPage ? `
                <div style="display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 40px;">
                  <div style="width: 350px;">
                    <div style="display: flex; justify-content: space-between; padding-bottom: 12px; font-size: 16px; color: #4b5563; font-weight: 300;"><span>Sub-Total</span><span>${formatRupiah(Number(invoice.sub_total))}</span></div>
                    <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #000000; padding-top: 12px;"><span style="font-size: 20px; font-weight: 900; letter-spacing: 2px;">TOTAL</span><span style="font-size: 20px; font-weight: 900;">${formatRupiah(Number(invoice.total_amount))}</span></div>
                  </div>
                </div>
              ` : ''}
            </div>
            ${isLastPage ? `
              <div style="position: absolute; bottom: 0px; left: 60px; right: 60px; padding-bottom: 40px;">
                <h3 style="font-size: 18px; font-weight: 900; margin: 0 0 16px 0; letter-spacing: 2px;">PAY TO:</h3>
                <div style="font-size: 15px; font-weight: 700;">
                  <div style="display: flex; margin-bottom: 8px;"><span style="width: 160px;">Bank</span><span>${settings?.bank || "BCA"}</span></div>
                  <div style="display: flex; margin-bottom: 8px;"><span style="width: 160px;">Account Name</span><span>${settings?.account_name || "Rania Kemala Ayu"}</span></div>
                  <div style="display: flex;"><span style="width: 160px;">Account Number</span><span>${settings?.account_number || "5271385456"}</span></div>
                </div>
                <div style="border-top: 3px solid #000000; margin: 16px 0 12px 0;"></div>
                
                <!-- WHATSAPP (MENGGUNAKAN GAMBAR) -->
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                  <img src="/logowa.png" style="width: 22px; height: 22px; display: block; margin-top: 17px;" />
                  <span style="font-size: 16px; font-weight: 600; letter-spacing: 1px; line-height: 1;">${settings?.wa_number || "0817-0765-594"}</span>
                </div>
              </div>
            ` : ''}
          </div>
        `;

        tempDiv.innerHTML = htmlString;
        container.appendChild(tempDiv);
        
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(tempDiv, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: "#ffffff",
          width: 800,
          height: 1000,
          windowWidth: 800,
          windowHeight: 1000
        });
        
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
        
        container.removeChild(tempDiv);
      }

      document.body.removeChild(container);
      pdf.save(`Invoice#${invoice.invoice_number.replace("#", "")}.pdf`);
    } catch (error) {
      console.error("Gagal generate PDF:", error);
      alert("Gagal membuat PDF. Silakan periksa console untuk detail.");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500 font-medium">Memuat detail invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center text-slate-500 py-10">Invoice tidak ditemukan.</div>;
  }

  const pagesPreview = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pagesPreview.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 sm:px-0">
        <button onClick={() => router.push("/dashboard/rasarasabyrania/invoice")} className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer">
          &larr; Kembali ke Daftar Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span>{isGeneratingPDF ? "Memproses..." : "Download PDF"}</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex flex-col items-center min-w-[850px] p-4">
          {pagesPreview.map((pageItems, index) => {
            const isLastPage = index === pagesPreview.length - 1;
            return renderPage(index, pageItems, isLastPage);
          })}
        </div>
      </div>
    </div>
  );
}