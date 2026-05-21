from pathlib import Path
from typing import Any

import joblib
import numpy as np

_BUNDLE: dict[str, Any] | None = None
_MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "house_model.joblib"


def load_bundle() -> dict[str, Any]:
    global _BUNDLE
    if _BUNDLE is None:
        if not _MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model not found at {_MODEL_PATH}. Run: python -m ml.train_model from backend/"
            )
        _BUNDLE = joblib.load(_MODEL_PATH)
    return _BUNDLE


def encode_location(location: str) -> int:
    b = load_bundle()
    loc = location.strip()
    idx_map: dict[str, int] = b["location_index"]
    if loc in idx_map:
        return idx_map[loc]
    # fuzzy: partial match
    low = loc.lower()
    for k, v in idx_map.items():
        if k.lower() in low or low in k.lower():
            return v
    return int(b["default_loc_idx"])


def amenity_count(amenities: str) -> int:
    if not amenities or not amenities.strip():
        return 0
    return len([a for a in amenities.split(",") if a.strip()])


def predict_vector(features: dict) -> tuple[float, float]:
    """
    Returns (predicted_price, confidence 0-1).
    Confidence from normalized std of tree predictions.
    """
    b = load_bundle()
    model = b["model"]
    loc_idx = encode_location(features["location"])
    x = np.array(
        [
            [
                loc_idx,
                float(features["sqft"]),
                int(features["bhk"]),
                int(features["bathrooms"]),
                int(features.get("parking", 0)),
                amenity_count(features.get("amenities", "")),
            ]
        ]
    )
    preds = np.array([t.predict(x)[0] for t in model.estimators_])
    mean_p = float(np.mean(preds))
    std_p = float(np.std(preds))
    # map std to confidence: lower variance -> higher confidence
    rel = std_p / max(mean_p, 1.0)
    confidence = float(max(0.55, min(0.98, 1.0 - min(rel * 4, 0.45))))
    return max(50_000.0, mean_p), confidence
