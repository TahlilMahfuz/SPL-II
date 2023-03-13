CREATE TABLE "User" (
    "User_ID" int   NOT NULL,
    "Username" varchar(100)   NOT NULL,
    "UserNID" varchar(15)   NOT NULL,
    "Useremail" varchar(100)   NOT NULL,
    "Age" int   NOT NULL,
    "Gender" varchar(10)   NOT NULL,
    "Userphone" varchar(11)   NOT NULL,
    "Userpassword" varchar(200)   NOT NULL,
    "Reg_date" date   NOT NULL,
    CONSTRAINT "pk_User" PRIMARY KEY (
        "User_ID"
     )
);

CREATE TABLE "Train" (
    "Train_ID" int   NOT NULL,
    "Trainname" varchar(100)   NOT NULL,
    CONSTRAINT "pk_Train" PRIMARY KEY (
        "Train_ID"
     )
);

CREATE TABLE "Station" (
    "Stationname" varchar(100)   NOT NULL,
    CONSTRAINT "pk_Station" PRIMARY KEY (
        "Stationname"
     )
);

CREATE TABLE "Reservation" (
    "Reservation_ID" int   NOT NULL,
    "User_ID" int   NOT NULL,
    "Train_ID" int   NOT NULL,
    "Username" varchar(100)   NOT NULL,
    "Reservation_date" date   NOT NULL,
    "Departure_time" timestamp   NOT NULL,
    "Starting_station" varchar(100)   NOT NULL,
    "Destination_station" varchar(100)   NOT NULL,
    CONSTRAINT "pk_Reservation" PRIMARY KEY (
        "Reservation_ID"
     )
);

CREATE TABLE "Schedule" (
    "Trip_ID" int   NOT NULL,
    "Train_ID" int   NOT NULL,
    "Stationname" varchar(100)   NOT NULL,
    "Arrival_time" timestamp   NOT NULL,
    "Departure_time" timestamp   NOT NULL,
    CONSTRAINT "pk_Schedule" PRIMARY KEY (
        "Trip_ID"
     )
);

CREATE TABLE "Fare" (
    "Starting_station" varchar(100)   NOT NULL,
    "Destination_station" varchar(100)   NOT NULL,
    "Amount" int   NOT NULL,
    CONSTRAINT "pk_Fare" PRIMARY KEY (
        "Starting_station","Destination_station"
     )
);

CREATE TABLE "Payment" (
    "Transaction_ID" int   NOT NULL,
    "Transactiontype" varchar(20)   NOT NULL,
    "User_ID" int   NOT NULL,
    "Amount" int   NOT NULL,
    CONSTRAINT "pk_Payment" PRIMARY KEY (
        "Transaction_ID"
     )
);

CREATE TABLE "Admin" (
    "Admin_ID" int   NOT NULL,
    "Password" varchar(200)   NOT NULL,
    "Masterkey" int   NOT NULL,
    CONSTRAINT "pk_Admin" PRIMARY KEY (
        "Admin_ID"
     )
);

ALTER TABLE "Reservation" ADD CONSTRAINT "fk_Reservation_User_ID" FOREIGN KEY("User_ID")
REFERENCES "User" ("User_ID");

ALTER TABLE "Reservation" ADD CONSTRAINT "fk_Reservation_Train_ID" FOREIGN KEY("Train_ID")
REFERENCES "Train" ("Train_ID");

ALTER TABLE "Reservation" ADD CONSTRAINT "fk_Reservation_Starting_station" FOREIGN KEY("Starting_station")
REFERENCES "Station" ("Stationname");

ALTER TABLE "Reservation" ADD CONSTRAINT "fk_Reservation_Destination_station" FOREIGN KEY("Destination_station")
REFERENCES "Station" ("Stationname");

ALTER TABLE "Schedule" ADD CONSTRAINT "fk_Schedule_Train_ID" FOREIGN KEY("Train_ID")
REFERENCES "Train" ("Train_ID");

ALTER TABLE "Schedule" ADD CONSTRAINT "fk_Schedule_Stationname" FOREIGN KEY("Stationname")
REFERENCES "Station" ("Stationname");

ALTER TABLE "Fare" ADD CONSTRAINT "fk_Fare_Starting_station" FOREIGN KEY("Starting_station")
REFERENCES "Station" ("Stationname");

ALTER TABLE "Fare" ADD CONSTRAINT "fk_Fare_Destination_station" FOREIGN KEY("Destination_station")
REFERENCES "Station" ("Stationname");

ALTER TABLE "Payment" ADD CONSTRAINT "fk_Payment_User_ID" FOREIGN KEY("User_ID")
REFERENCES "User" ("User_ID");

ALTER TABLE "Payment" ADD CONSTRAINT "fk_Payment_Amount" FOREIGN KEY("Amount")
REFERENCES "Fare" ("Amount");

