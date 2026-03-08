package com.clinicbooking.paymentservice.util;

import com.clinicbooking.paymentservice.dto.response.PaymentResponse;
import com.clinicbooking.paymentservice.entity.PaymentOrder;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public final class ReceiptPdfGenerator {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private ReceiptPdfGenerator() {
    }

    public static byte[] generate(PaymentOrder paymentOrder, PaymentResponse paymentResponse) {
        List<String> lines = new ArrayList<>();
        lines.add("HealthFlow Payment Receipt");
        lines.add("Order ID: " + safe(paymentOrder.getOrderId()));
        lines.add("Appointment ID: " + safe(paymentOrder.getAppointmentId()));
        lines.add("Patient: " + safe(paymentOrder.getPatientName()));
        lines.add("Doctor: " + safe(paymentOrder.getDoctorName()));
        lines.add("Description: " + safe(paymentOrder.getDescription()));
        lines.add("Amount: " + safe(paymentResponse.getFinalAmount()) + " " + safe(paymentResponse.getCurrency()));
        lines.add("Payment method: " + safe(paymentResponse.getPaymentMethod()));
        lines.add("Status: " + safe(paymentResponse.getStatus()));
        lines.add("Created at: " + formatDateTime(paymentOrder.getCreatedAt()));
        lines.add("Completed at: " + formatDateTime(paymentOrder.getCompletedAt()));

        StringBuilder contentStream = new StringBuilder();
        contentStream.append("BT\n/F1 12 Tf\n50 780 Td\n");
        boolean firstLine = true;
        for (String line : lines) {
            if (!firstLine) {
                contentStream.append("0 -18 Td\n");
            }
            contentStream.append("(").append(escape(line)).append(") Tj\n");
            firstLine = false;
        }
        contentStream.append("ET");

        String stream = contentStream.toString();
        String pdf = buildPdf(stream);
        return pdf.getBytes(StandardCharsets.US_ASCII);
    }

    private static String buildPdf(String stream) {
        StringBuilder pdf = new StringBuilder();
        List<Integer> offsets = new ArrayList<>();

        pdf.append("%PDF-1.4\n");

        offsets.add(pdf.length());
        pdf.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ")
                .append("/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        byte[] streamBytes = stream.getBytes(StandardCharsets.US_ASCII);
        offsets.add(pdf.length());
        pdf.append("5 0 obj\n<< /Length ").append(streamBytes.length).append(" >>\nstream\n")
                .append(stream)
                .append("\nendstream\nendobj\n");

        int xrefStart = pdf.length();
        pdf.append("xref\n0 6\n");
        pdf.append("0000000000 65535 f \n");
        for (Integer offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }
        pdf.append("trailer\n<< /Size 6 /Root 1 0 R >>\n");
        pdf.append("startxref\n").append(xrefStart).append("\n%%EOF");

        return pdf.toString();
    }

    private static String escape(Object value) {
        return safe(value)
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private static String safe(Object value) {
        return value == null ? "--" : String.valueOf(value);
    }

    private static String formatDateTime(java.time.LocalDateTime value) {
        return value == null ? "--" : DATE_TIME_FORMATTER.format(value);
    }
}
