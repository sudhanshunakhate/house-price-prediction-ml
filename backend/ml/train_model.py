"""Train RandomForest on synthetic numpy data; saves model bundle for API."""
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

LOCALITIES = [
    "Downtown",
    "Riverside",
    "Hills District",
    "Metro North",
    "Metro South",
    "Lakeview",
    "Industrial Zone",
    "University Area",
]

RNG = np.random.default_rng(42)


def synth_arrays(n: int = 2500):
    base = {
        "Downtown": 420_000,
        "Riverside": 310_000,
        "Hills District": 580_000,
        "Metro North": 265_000,
        "Metro South": 245_000,
        "Lakeview": 395_000,
        "Industrial Zone": 180_000,
        "University Area": 290_000,
    }
    loc_map = {name: i for i, name in enumerate(sorted(LOCALITIES))}
    X = np.zeros((n, 6), dtype=np.float64)
    y = np.zeros(n, dtype=np.float64)
    for i in range(n):
        loc = LOCALITIES[RNG.integers(0, len(LOCALITIES))]
        sqft = float(RNG.integers(650, 4200))
        bhk = int(RNG.integers(1, 6))
        bathrooms = int(max(1, min(bhk + RNG.integers(0, 2), 6)))
        parking = int(RNG.integers(0, 4))
        amen_count = int(RNG.integers(0, 8))
        p = (
            base[loc]
            + sqft * 85
            + bhk * 22_000
            + bathrooms * 12_000
            + parking * 15_000
            + amen_count * 8_000
            + RNG.normal(0, 35_000)
        )
        X[i] = [loc_map[loc], sqft, bhk, bathrooms, parking, amen_count]
        y[i] = max(80_000, p)
    return X, y, loc_map


def main():
    out_dir = Path(__file__).resolve().parent
    X, y, loc_map = synth_arrays(2500)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=18,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)

    bundle = {
        "model": model,
        "location_index": loc_map,
        "default_loc_idx": len(loc_map) // 2,
        "localities": LOCALITIES,
        "median_price": float(np.median(y)),
        "avg_price_per_sqft": float(np.median(y / X[:, 1])),
        "train_r2": float(score),
    }
    path = out_dir / "house_model.joblib"
    joblib.dump(bundle, path)
    print(f"Saved {path}, holdout R^2 ~ {score:.4f}")


if __name__ == "__main__":
    main()
