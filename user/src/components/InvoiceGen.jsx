import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order = {}) => {
  const doc = new jsPDF("p", "mm", "a4"); // Portrait mode for better readability
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // === BRAND HEADER WITH BACKGROUND ===
  doc.setFillColor(140, 179, 45); // Green background
  doc.rect(0, 0, pageWidth, 35, "F");

  // Company Logo/Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("AADHI JEVAN", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("A taste with Love", pageWidth / 2, 22, { align: "center" });

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageWidth / 2, 30, { align: "center" });

  // === INVOICE DETAILS BOX ===
  const boxY = 40;
  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(0.5);
  doc.rect(15, boxY, pageWidth - 30, 25);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", 20, boxY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(order.adhijevanOrderId || order.id || "N/A", 50, boxY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date:", 20, boxY + 14);
  doc.setFont("helvetica", "normal");
  const invoiceDate = new Date(order.createdAt || order.date || Date.now());
  doc.text(
    invoiceDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    50,
    boxY + 14
  );

  doc.setFont("helvetica", "bold");
  doc.text("Order Status:", 20, boxY + 21);
  doc.setFont("helvetica", "normal");

  // Set color based on order status
  if (order.orderStatus === "Delivered" || order.orderStatus === "Confirmed") {
    doc.setTextColor(0, 128, 0); // Green
  } else if (order.orderStatus === "Cancelled") {
    doc.setTextColor(200, 0, 0); // Red
  } else {
    doc.setTextColor(255, 140, 0); // Orange
  }
  doc.text(order.orderStatus || "N/A", 50, boxY + 21);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", pageWidth - 80, boxY + 7);
  doc.setFont("helvetica", "normal");

  // Set color based on payment status
  if (order.paymentStatus === "Paid") {
    doc.setTextColor(0, 128, 0); // Green
  } else {
    doc.setTextColor(255, 140, 0); // Orange
  }
  doc.text(order.paymentStatus || "N/A", pageWidth - 45, boxY + 7);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Method:", pageWidth - 80, boxY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentMethod || "COD", pageWidth - 45, boxY + 14);

  // === SELLER & BUYER INFO ===
  const infoY = boxY + 35;

  // Seller Info Box
  doc.setFillColor(245, 245, 245);
  doc.rect(15, infoY, (pageWidth - 35) / 2, 35, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, infoY, (pageWidth - 35) / 2, 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(46, 125, 50);
  doc.text("SELLER DETAILS", 20, infoY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Aadhi Jevan Pvt. Ltd.", 20, infoY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("123 Healthy Life Street", 20, infoY + 19);
  doc.text("Wellness City, Maharashtra", 20, infoY + 23);
  doc.text("GSTIN: 27AAQFA1234Z1Z5", 20, infoY + 27);
  doc.text("Phone: +91 7020014774", 20, infoY + 31);

  // Buyer Info Box
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth / 2 + 5, infoY, (pageWidth - 35) / 2, 35, "F");
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth / 2 + 5, infoY, (pageWidth - 35) / 2, 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(46, 125, 50);
  doc.text("BILL TO", pageWidth / 2 + 10, infoY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(order.customerName || "N/A", pageWidth / 2 + 10, infoY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Handle address properly - convert to string if it's an array or object
  let address = "N/A";
  if (order.addresses) {
    if (Array.isArray(order.addresses)) {
      // If it's an array, get the last address (most recent)
      const lastAddress = order.addresses[order.addresses.length - 1];
      if (typeof lastAddress === 'string') {
        address = lastAddress;
      } else if (lastAddress && typeof lastAddress === 'object') {
        // If it's an address object, construct the string
        address = [
          lastAddress.street,
          lastAddress.city,
          lastAddress.state,
          lastAddress.pincode
        ].filter(Boolean).join(", ");
      }
    } else if (typeof order.addresses === 'string') {
      address = order.addresses;
    } else if (typeof order.addresses === 'object') {
      // If it's an address object
      address = [
        order.addresses.street,
        order.addresses.city,
        order.addresses.state,
        order.addresses.pincode
      ].filter(Boolean).join(", ");
    }
  }

  const addressLines = doc.splitTextToSize(address, (pageWidth - 35) / 2 - 10);
  let addressY = infoY + 19;
  addressLines.slice(0, 2).forEach((line) => {
    doc.text(line, pageWidth / 2 + 10, addressY);
    addressY += 4;
  });

  doc.text(`Phone: ${order.customerPhone || "N/A"}`, pageWidth / 2 + 10, addressY + 4);
  if (order.customerEmail) {
    doc.text(`Email: ${order.customerEmail}`, pageWidth / 2 + 10, addressY + 8);
  }

  // === ITEM TABLE ===
  const tableY = infoY + 42;

  // Debug: Log order data
  console.log("📄 Invoice Order Data:", order);
  console.log("📦 Order Items:", order?.orderItems);
  console.log("💰 Delivery Fee:", order.deliveryFee);
  console.log("💰 Tax:", order.tax);
  console.log("💰 Total Amount:", order.totalAmount);

  // Calculate subtotal from items
  const itemsSubtotal = (order?.orderItems || []).reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0);
    console.log(`Item: ${item.name}, Qty: ${item.quantity}, Price: ${item.price}, Total: ${itemTotal}`);
    return sum + itemTotal;
  }, 0);

  console.log("💵 Calculated Subtotal:", itemsSubtotal);

  const tableBody = (order?.orderItems || []).map((item, index) => {
    const total = (item.quantity || 0) * (item.price || 0);
    return [
      index + 1,
      item.name || `Item #${item.menuItemId}`,
      item.quantity || 0,
      `Rs. ${(item.price || 0).toFixed(2)}`,
      `Rs. ${total.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: tableY,
    head: [["#", "Item Description", "Qty", "Unit Price", "Amount"]],
    body: tableBody,
    theme: "striped",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [140, 178, 45],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 80, halign: "left" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // === SUMMARY TABLE ===
  let summaryY = doc.lastAutoTable.finalY + 5;

  // Calculate GST and delivery fee if not provided
  let deliveryFee = order.deliveryFee;
  let gstAmount = order.tax;
  let gstPercentage = 5; // Default GST percentage

  // If delivery fee is not provided, calculate it
  if (deliveryFee === undefined || deliveryFee === null) {
    deliveryFee = itemsSubtotal >= 150 ? 0 : 50;
    console.log("⚠️ Delivery fee not in order, calculated:", deliveryFee);
  }

  // Calculate GST percentage dynamically from order data
  if (gstAmount !== undefined && gstAmount !== null && itemsSubtotal > 0) {
    gstPercentage = Math.round((gstAmount / itemsSubtotal) * 100);
    console.log("✅ GST percentage calculated from order:", gstPercentage + "%");
  } else {
    // If GST is not provided, calculate it using default 5%
    gstAmount = itemsSubtotal * (gstPercentage / 100);
    console.log("⚠️ GST not in order, calculated with " + gstPercentage + "%:", gstAmount);
  }

  const summaryData = [
    ["Subtotal", `Rs. ${itemsSubtotal.toFixed(2)}`],
  ];

  summaryData.push([
    deliveryFee === 0 ? "Delivery Fee (FREE)" : "Delivery Fee",
    `Rs. ${deliveryFee.toFixed(2)}`,
  ]);

  summaryData.push([`GST (${gstPercentage}%)`, `Rs. ${gstAmount.toFixed(2)}`]);

  console.log("📊 Summary Data:", summaryData);

  autoTable(doc, {
    startY: summaryY,
    body: summaryData,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: pageWidth - 85, halign: "right", fontStyle: "bold" },
      1: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // === GRAND TOTAL ===
  summaryY = doc.lastAutoTable.finalY + 2;
  doc.setFillColor(140, 179, 45);
  doc.rect(15, summaryY, pageWidth - 30, 10, "F");

  // Calculate grand total
  const grandTotal = order.totalAmount || (itemsSubtotal + gstAmount + deliveryFee);
  console.log("💰 Grand Total:", grandTotal);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("GRAND TOTAL", pageWidth - 60, summaryY + 7, { align: "right" });
  doc.text(
    `Rs. ${grandTotal.toFixed(2)}`,
    pageWidth - 20,
    summaryY + 7,
    { align: "right" }
  );

  // === NOTES SECTION ===
  let notesY = summaryY + 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Notes:", 15, notesY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  notesY += 5;

  if (order.orderStatus === "Cancelled") {
    doc.setTextColor(200, 0, 0);
    doc.text(
      "• This order has been cancelled. Refunds are not applicable for online payments.",
      20,
      notesY
    );
    notesY += 5;
  } else if (order.paymentStatus === "Paid") {
    doc.setTextColor(0, 128, 0);
    doc.text("• Payment confirmed. Thank you for your order!", 20, notesY);
    notesY += 5;
  }

  doc.setTextColor(0, 0, 0);
  doc.text("• For any queries, please contact us at support@aadhijevan.com", 20, notesY);
  notesY += 5;
  doc.text("• This is a computer-generated invoice and does not require a signature.", 20, notesY);

  // === FOOTER ===
  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Aadhi Jevan - A taste with Love", pageWidth / 2, pageHeight - 18, {
    align: "center",
  });
  doc.text(
    "Email: support@aadhijevan.com | Phone: +91 7020014774",
    pageWidth / 2,
    pageHeight - 14,
    { align: "center" }
  );
  doc.text("www.aadhijevan.in", pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  // === SAVE FILE ===
  const fileName = `Invoice_${order.adhijevanOrderId || order.id || "Order"}.pdf`;
  doc.save(fileName);
};

export default generateInvoicePDF;
