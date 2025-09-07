DELETE FROM HW_CARS;

INSERT INTO HW_CARS (car_id, car_name, car_color, car_photo, car_treasure, car_creation_date)
VALUES ('JBB75', 'FORD GT', '#000000', 'cars/ford-gt.jpg', '0', datetime(current_timestamp, 'localtime'));
