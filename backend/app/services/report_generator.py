import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.schemas.valuation import ValuationResponse, ValuationRequest

class ReportGenerator:
    @staticmethod
    def generate_valuation_pdf(val_response: ValuationResponse, req: ValuationRequest) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        story = []
        styles = getSampleStyleSheet()

        # Custom Typography
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#64748b")
        )
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#1e293b"),
            fontName="Helvetica-Bold",
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#334155")
        )
        callout_style = ParagraphStyle(
            'CalloutText',
            parent=styles['Normal'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0284c7"),
            fontName="Helvetica-Bold"
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor("#94a3b8")
        )

        # Header Section
        story.append(Paragraph("PROPVALUE AI — PROPERTY VALUATION REPORT", title_style))
        story.append(Paragraph(
            f"Generated on {datetime.now(timezone.utc).strftime('%B %d, %Y at %H:%M UTC')} | Locality: {val_response.locality_name}, Pune",
            subtitle_style
        ))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=15))

        # Executive Valuation Summary Box
        summary_data = [
            [
                Paragraph("<b>Estimated Fair Market Value</b>", body_style),
                Paragraph("<b>Calibrated Price Range (10th–90th %)</b>", body_style),
                Paragraph("<b>Rate / Sq.Ft.</b>", body_style)
            ],
            [
                Paragraph(f"₹{val_response.estimated_value:,.0f}", callout_style),
                Paragraph(f"₹{val_response.estimated_low:,.0f} – ₹{val_response.estimated_high:,.0f}", body_style),
                Paragraph(f"₹{val_response.estimated_price_sqft:,.0f} / sqft", body_style)
            ]
        ]
        summary_table = Table(summary_data, colWidths=[200, 200, 140])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))

        # Subject Property Parameters
        story.append(Paragraph("1. Subject Property Specifications", section_style))
        prop_data = [
            ["Locality", val_response.locality_name, "Property Type", req.property_type.title()],
            ["Carpet Area", f"{req.carpet_area_sqft} sq.ft.", "Bedrooms / Bathrooms", f"{req.bedrooms} BHK / {req.bathrooms} Baths"],
            ["Floor Position", f"Floor {req.floor_number} of {req.total_floors}", "Structure Age", f"{req.property_age_years} years"],
            ["Furnishing Status", req.furnishing.replace('_', ' ').title(), "Parking Bays", f"{req.parking_count} Covered"],
            ["Building Condition", req.building_condition.replace('_', ' ').title(), "Road Width", f"{req.road_width_ft} ft. Arterial"],
        ]
        prop_table = Table(prop_data, colWidths=[135, 135, 135, 135])
        prop_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#1e293b")),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(prop_table)
        story.append(Spacer(1, 15))

        # Fair Price Assessment if available
        if val_response.fair_price:
            story.append(Paragraph("2. Fair Price & Asking Price Assessment", section_style))
            fp = val_response.fair_price
            status_color = "#16a34a" if fp.status == "Undervalued" else ("#ea580c" if "overpriced" in fp.status.lower() else "#0284c7")
            fp_data = [
                ["Seller Asking Price", f"₹{fp.asking_price:,.0f}"],
                ["AI Fair Market Value", f"₹{fp.estimated_value:,.0f}"],
                ["Price Variance", f"₹{fp.difference_rupees:,.0f} ({fp.difference_percentage:+.1f}%)"],
                ["Assessment Verdict", fp.status.upper()]
            ]
            fp_table = Table(fp_data, colWidths=[200, 340])
            fp_table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f8fafc")),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(fp_table)
            story.append(Spacer(1, 6))
            story.append(Paragraph(f"<b>Valuation Note:</b> {fp.explanation}", body_style))
            story.append(Spacer(1, 15))

        # Key Feature Impact Breakdown (SHAP Explanations)
        story.append(Paragraph("3. Valuation Driver Attribution (SHAP Breakdown)", section_style))
        expl_rows = [["Factor Name", "Input Metric", "Valuation Impact (INR)", "Attribution Effect"]]
        for e in val_response.explanations[:5]:
            expl_rows.append([
                e.feature_name,
                e.feature_value,
                f"{'+' if e.shap_value > 0 else ''}₹{e.shap_value:,.0f}",
                e.impact_direction.title()
            ])
        expl_table = Table(expl_rows, colWidths=[160, 140, 130, 110])
        expl_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(expl_table)
        story.append(Spacer(1, 15))

        # Comparable Properties
        if val_response.comparables:
            story.append(Paragraph("4. Benchmark Comparable Properties", section_style))
            comp_rows = [["Property", "Distance", "Carpet Area", "Price (INR)", "Rate/sqft", "Similarity"]]
            for c in val_response.comparables[:4]:
                comp_rows.append([
                    c.title[:25],
                    f"{c.distance_meters:,.0f} m",
                    f"{c.carpet_area_sqft:,.0f} sqft",
                    f"₹{c.price:,.0f}",
                    f"₹{c.price_per_sqft:,.0f}",
                    f"{int(c.similarity_score * 100)}%"
                ])
            comp_table = Table(comp_rows, colWidths=[150, 70, 80, 95, 85, 60])
            comp_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(comp_table)
            story.append(Spacer(1, 15))

        # Methodology & Legal Disclaimer
        story.append(Paragraph("5. Methodology, Data Provenance & Legal Disclaimers", section_style))
        story.append(Paragraph(
            f"<b>Model Architecture:</b> {val_response.model_type} ({val_response.model_version}). "
            f"<b>Confidence:</b> {val_response.confidence_label} ({int(val_response.confidence_score * 100)}%). "
            f"<b>Data Sources:</b> {val_response.data_freshness_note}",
            body_style
        ))
        story.append(Spacer(1, 8))
        disclaimer_text = (
            "LEGAL DISCLAIMER: This valuation report is an automated statistical estimate generated by PropValue AI algorithms "
            "for informational and decision-support purposes only. It DOES NOT constitute a statutory valuation under the Indian Stamp Act, "
            "a formal banking mortgage appraisal, architectural structural audit, or legal title certification. Physical inspection, title verification "
            "at the Sub-Registrar Office, and formal legal due diligence by an advocate are strongly advised prior to executing any financial transaction."
        )
        story.append(Paragraph(disclaimer_text, disclaimer_style))

        doc.build(story)
        buffer.seek(0)
        return buffer

