DROP TABLE IF EXISTS HW_CARS;

CREATE TABLE IF NOT EXISTS HW_CARS (
    id INTEGER PRIMARY KEY,
    car_id TEXT NOT NULL,
    car_name TEXT NOT NULL,
    car_color TEXT NOT NULL,
    car_photo TEXT NOT NULL,
    car_treasure TEXT NOT NULL,
    car_creation_date INTEGER NOT NULL,
    UNIQUE(car_id, car_treasure)
);