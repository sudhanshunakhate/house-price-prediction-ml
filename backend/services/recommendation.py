from services import ml_service


def build_recommendation(features: dict, predicted: float, confidence: float) -> tuple[str, list[str]]:
    """Rule + data-driven insights (AI-style copy for product UX)."""
    insights: list[str] = []
    b = ml_service.load_bundle()
    median_p = b.get("median_price", predicted)
    avg_psf = b.get("avg_price_per_sqft", 120)

    psf = predicted / max(features["sqft"], 1)
    if predicted < median_p * 0.92:
        insights.append("Predicted price sits **below** the portfolio median - possible value opportunity.")
    elif predicted > median_p * 1.08:
        insights.append("Predicted price is **above** typical listings - premium segment or high-demand pocket.")
    else:
        insights.append("Predicted price aligns with **balanced** market positioning.")

    if psf > avg_psf * 1.12:
        insights.append(f"Price/sqft (~${psf:,.0f}) is elevated vs median market efficiency.")
    elif psf < avg_psf * 0.88:
        insights.append(f"Price/sqft (~${psf:,.0f}) looks efficient - more space per dollar.")

    if int(features.get("parking", 0)) >= 2 and int(features["bhk"]) >= 3:
        insights.append("Parking + bedroom mix supports **family buyer** demand.")

    if confidence >= 0.85:
        insights.append("Model agreement across trees is **strong** for this input profile.")
    else:
        insights.append("Confidence is moderate - consider comparable sales in the same micro-market.")

    # headline recommendation
    if predicted < median_p * 0.9 and confidence > 0.75:
        rec = "Favorable for buyers/investors seeking upside; validate with local comps."
    elif predicted > median_p * 1.1:
        rec = "Premium pricing - emphasize differentiation (views, schools, transit)."
    else:
        rec = "Neutral market fit - standard listing strategy and staged marketing recommended."

    return rec, insights
