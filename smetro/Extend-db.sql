CREATE TABLE "Station" (
  "Station Name" <type>
);

CREATE TABLE "Train" (
  "Train_ID" <type>,
  "Trainname" <type>
);

CREATE TABLE "Schedule" (
  "Station_name" <type>,
  "Train_ID" <type>,
  "Trip_ID" <type>,
  "Arrival_Time" <type>,
  "Departure_Time" <type>,
  CONSTRAINT "FK_Schedule.Station_name"
    FOREIGN KEY ("Station_name")
      REFERENCES "Station"("Station Name"),
  CONSTRAINT "FK_Schedule.Train_ID"
    FOREIGN KEY ("Train_ID")
      REFERENCES "Train"("Train_ID")
);

CREATE TABLE "User" (
  "User_ID" <type>,
  "Username" <type>,
  "UserNID" <type>,
  "Useremail" <type>,
  "Age" <type>,
  "Gender" <type>,
  "Userphone" <type>,
  "Userpassword" <type>,
  "Reg_date" <type>
);

CREATE TABLE "Payment" (
  "Transaction_ID" <type>,
  "User_ID" <type>,
  "Transaction_Type" <type>,
  "Amount" <type>,
  CONSTRAINT "FK_Payment.User_ID"
    FOREIGN KEY ("User_ID")
      REFERENCES "User"("User_ID")
);

CREATE TABLE "Admin" (
  "Admin_ID" <type>,
  "Password" <type>,
  "Masterkey" <type>
);

CREATE TABLE "Fare" (
  "Fare_ID" <type>,
  "Starting_Station" <type>,
  "Destination_Station" <type>,
  "Amount" <type>,
  CONSTRAINT "FK_Fare.Starting_Station"
    FOREIGN KEY ("Starting_Station")
      REFERENCES "Station"("Station Name"),
  CONSTRAINT "FK_Fare.Destination_Station"
    FOREIGN KEY ("Destination_Station")
      REFERENCES "Station"("Station Name")
);

CREATE TABLE "Reservation" (
  "Reservation_ID" <type>,
  "User_ID" <type>,
  "Train_ID" <type>,
  "Username" <type>,
  "Reservation_date" <type>,
  "Departure_Time" <type>,
  "Starting_Station" <type>,
  "Destination_Station" <type>,
  "Fare_ID" <type>,
  CONSTRAINT "FK_Reservation.Train_ID"
    FOREIGN KEY ("Train_ID")
      REFERENCES "Train"("Train_ID"),
  CONSTRAINT "FK_Reservation.User_ID"
    FOREIGN KEY ("User_ID")
      REFERENCES "User"("User_ID"),
  CONSTRAINT "FK_Reservation.Fare_ID"
    FOREIGN KEY ("Fare_ID")
      REFERENCES "Fare"("Fare_ID")
);

CREATE TABLE "Administration" (
  "Admiin_ID" <type>,
  "Station_name" <type>,
  "Train_ID" <type>,
  "Fare_ID" <type>,
  CONSTRAINT "FK_Administration.Admiin_ID"
    FOREIGN KEY ("Admiin_ID")
      REFERENCES "Admin"("Admin_ID"),
  CONSTRAINT "FK_Administration.Station_name"
    FOREIGN KEY ("Station_name")
      REFERENCES "Station"("Station Name"),
  CONSTRAINT "FK_Administration.Train_ID"
    FOREIGN KEY ("Train_ID")
      REFERENCES "Train"("Train_ID"),
  CONSTRAINT "FK_Administration.Fare_ID"
    FOREIGN KEY ("Fare_ID")
      REFERENCES "Fare"("Fare_ID")
);

CREATE TABLE "Return_Policy" (
  "Return_ID" <type>,
  "Reservation_ID" <type>,
  "Admiin_ID" <type>
);

