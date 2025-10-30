import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER


def generate_pdf_report(
    file_path,
    report_title,
    meeting_name,
    meeting_date,
    meeting_time,
    summary,
    highlights,
    tasks,
    dates,
    participants=None,
    attachments=None
):
    """
    Generates a professional meeting summary report in PDF format.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=30
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title', parent=styles['Title'], fontName='Times-Bold',
        fontSize=22, alignment=TA_CENTER, spaceAfter=18
    )
    normal_style = ParagraphStyle(
        'Normal', parent=styles['Normal'], fontName='Times-Roman',
        fontSize=11, leading=14, alignment=TA_LEFT
    )
    heading_style = ParagraphStyle(
        'Heading', parent=styles['Heading2'], fontName='Times-Bold',
        fontSize=14, leading=18, spaceAfter=8
    )
    subheading_style = ParagraphStyle(
        'SubHeading', parent=styles['Heading3'], fontName='Times-BoldItalic',
        fontSize=12, spaceBefore=10, spaceAfter=6
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'], fontName='Times-Italic',
        fontSize=9, alignment=TA_CENTER, textColor=colors.grey
    )

    elements = []

    # --------------------
    # Header
    # --------------------
    elements.append(Paragraph(f"{report_title}", title_style))
    elements.append(Paragraph(f"<b>Date:</b> {meeting_date}", normal_style))
    elements.append(Paragraph(f"<b>Time:</b> {meeting_time}", normal_style))
    elements.append(Spacer(1, 0.25 * inch))

    # --------------------
    # Participants
    # --------------------
    if participants:
        elements.append(Paragraph("Participants", heading_style))
        participant_data = [[Paragraph("<b>Name</b>", normal_style)]] + [
            [Paragraph(p, normal_style)] for p in participants
        ]
        participant_table = Table(participant_data, colWidths=[6.5 * inch])
        participant_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FFE082")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold')
        ]))
        elements.append(participant_table)
        elements.append(Spacer(1, 0.3 * inch))

    # --------------------
    # Executive Summary
    # --------------------
    elements.append(Paragraph("Executive Summary", heading_style))
    elements.append(Paragraph(summary, normal_style))
    elements.append(Spacer(1, 0.25 * inch))

    # --------------------
    # Key Highlights
    # --------------------
    if highlights:
        elements.append(Paragraph("Key Highlights", subheading_style))
        for h in highlights:
            elements.append(Paragraph(f"• {h}", normal_style))
        elements.append(Spacer(1, 0.25 * inch))

    # --------------------
    # Action Items
    # --------------------
    if tasks:
        elements.append(Paragraph("Action Items", heading_style))
        task_data = [[Paragraph("<b>Task</b>", normal_style),
                      Paragraph("<b>Responsible</b>", normal_style)]]
        for t in tasks:
            task_data.append([
                Paragraph(t["task"], normal_style),
                Paragraph(t["person"], normal_style)
            ])
        task_table = Table(task_data, colWidths=[4.5 * inch, 2 * inch])
        task_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#BBDEFB")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold')
        ]))
        elements.append(task_table)
        elements.append(Spacer(1, 0.3 * inch))

    # --------------------
    # Important Dates
    # --------------------
    if dates:
        elements.append(Paragraph("Important Dates", heading_style))
        date_data = [[Paragraph("<b>Date</b>", normal_style)]] + [
            [Paragraph(d, normal_style)] for d in dates
        ]
        date_table = Table(date_data, colWidths=[6.5 * inch])
        date_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#C5E1A5")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold')
        ]))
        elements.append(date_table)
        elements.append(Spacer(1, 0.3 * inch))

    # --------------------
    # Attachments
    # --------------------
    if attachments:
        elements.append(Paragraph("Attachments / References", heading_style))
        for att in attachments:
            elements.append(Paragraph(f"- {att}", normal_style))
    else:
        elements.append(Paragraph("Attachments / References: None", normal_style))

    # --------------------
    # Footer
    # --------------------
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(
        Paragraph(
            "Confidential — This report is auto-generated and intended for internal use only.",
            footer_style
        )
    )

    doc.build(elements)
    print(f"✅ PDF generated: {file_path}")
