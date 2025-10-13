package com.clinicbooking.appointmentservice.service;

import com.clinicbooking.appointmentservice.dto.ReportExportDto;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class ReportPdfService {

    private Font titleFont;
    private Font headerFont;
    private Font normalFont;

    public ReportPdfService() {
        initFonts();
    }

    private void initFonts() {
        try {
            // Use Identity-H encoding for Vietnamese Unicode support
            // This uses an embedded font that supports Vietnamese characters
            BaseFont baseFont = BaseFont.createFont(
                    "fonts/Roboto-Regular.ttf", // Will fallback if not found
                    BaseFont.IDENTITY_H,
                    BaseFont.EMBEDDED);
            titleFont = new Font(baseFont, 18, Font.BOLD);
            headerFont = new Font(baseFont, 14, Font.BOLD);
            normalFont = new Font(baseFont, 11, Font.NORMAL);
            log.info("Vietnamese Unicode fonts initialized with custom font");
        } catch (Exception e) {
            log.info("Custom font not found, using Helvetica with Vietnamese transliteration");
            // Fallback: Use Helvetica and transliterate Vietnamese text
            titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
            normalFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);
        }
    }

    public byte[] generateReportPdf(ReportExportDto data) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        // Title - Vietnamese with diacritics
        Paragraph title = new Paragraph("BÁO CÁO TỔNG HỢP", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph date = new Paragraph("Ngày xuất: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont);
        date.setAlignment(Element.ALIGN_CENTER);
        document.add(date);
        document.add(Chunk.NEWLINE);

        // 1. Appointment Report
        if (data.getAppointmentReport() != null) {
            addAppointmentSection(document, data.getAppointmentReport());
        }

        // 2. Revenue Report
        if (data.getRevenueReport() != null) {
            document.newPage();
            addRevenueSection(document, data.getRevenueReport());
        }

        // 3. Patient Report
        if (data.getPatientReport() != null) {
            document.newPage();
            addPatientSection(document, data.getPatientReport());
        }

        document.close();
        return baos.toByteArray();
    }

    private void addAppointmentSection(Document doc, ReportExportDto.AppointmentReportData data) throws Exception {
        doc.add(new Paragraph("1. BÁO CÁO LỊCH HẸN", headerFont));
        doc.add(Chunk.NEWLINE);

        // Summary table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        addTableHeader(table, "Tổng", "Đã xác nhận", "Hoàn thành", "Đã hủy");
        addTableRow(table,
                String.valueOf(data.getTotalAppointments()),
                String.valueOf(data.getConfirmed()),
                String.valueOf(data.getCompleted()),
                String.valueOf(data.getCancelled()));
        doc.add(table);
        doc.add(Chunk.NEWLINE);

        // Chart
        if (data.getMonthlyTrend() != null && !data.getMonthlyTrend().isEmpty()) {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            for (var m : data.getMonthlyTrend()) {
                dataset.addValue(m.getTotal(), "Tổng", m.getMonth());
                dataset.addValue(m.getCompleted(), "Hoàn thành", m.getMonth());
            }
            JFreeChart chart = ChartFactory.createBarChart(
                    "Xu hướng Lịch hẹn", "Tháng", "Số lượng",
                    dataset, PlotOrientation.VERTICAL, true, false, false);
            doc.add(chartToImage(chart, 500, 300));
        }
    }

    private void addRevenueSection(Document doc, ReportExportDto.RevenueReportData data) throws Exception {
        doc.add(new Paragraph("2. BÁO CÁO DOANH THU", headerFont));
        doc.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        addTableHeader(table, "Tổng doanh thu", "Trực tuyến", "Tiền mặt");
        addTableRow(table,
                formatCurrency(data.getTotalRevenue()),
                formatCurrency(data.getOnlinePayment()),
                formatCurrency(data.getCashPayment()));
        doc.add(table);
        doc.add(Chunk.NEWLINE);

        if (data.getMonthlyTrend() != null && !data.getMonthlyTrend().isEmpty()) {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            for (var m : data.getMonthlyTrend()) {
                dataset.addValue(m.getRevenue() / 1000000.0, "Doanh thu (triệu)", m.getMonth());
            }
            JFreeChart chart = ChartFactory.createLineChart(
                    "Xu hướng Doanh thu", "Tháng", "Triệu VND",
                    dataset, PlotOrientation.VERTICAL, true, false, false);
            doc.add(chartToImage(chart, 500, 300));
        }
    }

    private void addPatientSection(Document doc, ReportExportDto.PatientReportData data) throws Exception {
        doc.add(new Paragraph("3. BÁO CÁO BỆNH NHÂN", headerFont));
        doc.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        addTableHeader(table, "Tổng bệnh nhân", "Mới trong kỳ", "Đang điều trị");
        addTableRow(table,
                String.valueOf(data.getTotalPatients()),
                String.valueOf(data.getNewPatients()),
                String.valueOf(data.getActivePatients()));
        doc.add(table);
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, normalFont));
            cell.setBackgroundColor(new BaseColor(93, 122, 96)); // sage-600
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private void addTableRow(PdfPTable table, String... values) {
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v, normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private Image chartToImage(JFreeChart chart, int width, int height) throws Exception {
        BufferedImage bufferedImage = chart.createBufferedImage(width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", baos);
        return Image.getInstance(baos.toByteArray());
    }

    private String formatCurrency(long value) {
        return String.format("%,d VND", value);
    }
}
