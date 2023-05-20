-- SMETRO
drop table stuckpassengers;
drop table reservation;
drop table users;
drop table nidrecord;
drop table admins;
drop table fares;
drop table trains;


create table nidrecord(
    nid varchar primary key
);
create table users(
    userid serial primary key,
    Username varchar(100),
    userNID varchar(100),
    useremail varchar(100),
    userphone varchar(100),
    userpassword varchar(300),
    userbalance int default 1000,
    reg_date date not null default current_timestamp,
    foreign key (usernid) references nidrecord(nid)
);

create table trains(
    trainid serial primary key,
    trainname varchar(100),
    departure varchar(100),
    destination varchar(100),
    departuredate date,
    departuretime timestamp,
    arrivaltime timestamp,
    seats int
);

CREATE TABLE reservation (
    reservationid SERIAL PRIMARY KEY,
    trainid INT,
    userid INT,
    availability smallint default 1,
    qr_code bytea, -- new column to store QR code image data
    scanned_entertime timestamp,
    scanned_departuretime timestamp,
    reserve_time date not null default current_timestamp,
    FOREIGN KEY (trainid) REFERENCES trains(trainid) on delete set null ,
    FOREIGN KEY (userid) REFERENCES users(userid) on delete set null
);

create table admins(
    adminid serial primary key,
    adminname varchar(100),
    adminNID varchar(100),
    adminemail varchar(100),
    adminphone varchar(100),
    adminpassword varchar(300),
    reg_date date not null default current_timestamp
);

create table fares(
    fareid serial primary key,
    departure varchar(100),
    destination varchar(100),
    amount double precision
);

create table stuckpassengers(
    stuckpassengerid serial primary key,
    reservationID int,
    status int default 0,
    extraCharge double precision,
    foreign key (reservationID) references reservation(reservationID) on delete set null
);




update stuckpassengers set status=status-1 where reservationid = 1
select * from stuckpassengers;
select * from reservation;
select * from trains;
select * from users;
select * from fares;
update reservation set scanned_entertime=now() where reservationid=$1;
select * from stuckpassengers natural join reservation natural join users where status=0;

-- Copy only this portion

-- These are the rough. Dont copy them to database

update reservation
set availability=4 and
where reservationid=$1;

update users
set userbalance=userbalance+$2
where userid=$3;

update trains
set seats=seats+1
where trainid=$1;

select availability
from reservation
where reservationid=1



SELECT reservationid, amount, departuretime, DATE_PART('day', departuretime - current_date) AS remainingtimeindays,userid,trainid
      FROM reservation
      NATURAL JOIN fares
      NATURAL JOIN trains
      WHERE fares.destination = trains.destination
      AND fares.departure = trains.departure
      AND reservationid = 1

SELECT reservationid, amount, departuretime,departuretime- current_date AS remainingtimeindays
      FROM reservation
      NATURAL JOIN fares
      NATURAL JOIN trains
      WHERE fares.destination = trains.destination
      AND fares.departure = trains.departure
      AND reservationid = 1

insert into nidrecord values ('123');

update reservation set availability=2 where reservationid=6;
delete from reservation where reservationid=5
delete from stuckpassangers where reservationid=6
select * from reservation;
select * from stuckpassangers;

select departuretime,availability from reservation natural join trains where reservationid=1

insert into stuckpassangers (reservationID, extraCharge)
values(3,10000);
select * from stuckpassangers;
select * from reservation;
delete from reservation;

update reservation
        set
            scanned_entertime=case
                when availability=1 then now()
                else scanned_entertime
            end,
            scanned_departuretime=case
                when availability=2 then now()
                else scanned_departuretime
            end,
            availability=availability+1
        where reservationid=1
returning reservation.scanned_departuretime,reservation.scanned_entertime;



alter table users add userbalance int default 1000;
update users set userbalance=10;

update users set userbalance=userbalance-100 where userid=1;


alter table reservation add column scanned_entertime timestamp;
alter table reservation add column scanned_departuretime timestamp;

select * from reservation order by reservationid asc;
select departuretime from reservation natural join trains where reservationid=4;

update reservation set availability=1 where reservationid=1
UPDATE trains SET departuretime = NOW() + INTERVAL '1000 minutes',
                  arrivaltime = NOW() - INTERVAL '100 minutes'
              WHERE trainid = 1;

select * from users;



select * from trains;

drop table fares;


select * from fares;

select amount from trains natural join fares where trainid=1;
update users set userbalance=userbalance-$1 where userid=$2;

select departure,destination from reservation natural join trains
where userid=$1;




drop table admins;


select * from admins;

SELECT * FROM trains natural join fares;

update trains set seats=seats-1
where trainid=1;

select * from trains;

INSERT INTO trains (trainname,departure,destination,departuredate,departuretime,arrivaltime,seats)
                        VALUES ('SuperExpress', 'mohakhali', 'uttara',
                                to_date('11-03-2023','dd-mm-yyyy'),
                                TO_TIMESTAMP('11-03-2023 12:34:56', 'DD-MM-YYYY HH24:MI:SS'),
                                TO_TIMESTAMP('11-03-2023 18:34:56', 'DD-MM-YYYY HH24:MI:SS'),100);
INSERT INTO trains (trainname,departure,destination,departuredate,departuretime,arrivaltime,seats)
                        VALUES ('GulshanExpress', 'mohakhali', 'uttara',
                                to_date('11-03-2023','dd-mm-yyyy'),
                                TO_TIMESTAMP('11-03-2023 12:34:56', 'DD-MM-YYYY HH24:MI:SS'),
                                TO_TIMESTAMP('11-03-2023 18:34:56', 'DD-MM-YYYY HH24:MI:SS'),100);
INSERT INTO trains (trainname,departure,destination,departuredate,departuretime,arrivaltime,seats)
                        VALUES ('MohakhaliExpress', 'mohakhali', 'mirpur',
                                to_date('11-03-2023','dd-mm-yyyy'),
                                TO_TIMESTAMP('11-03-2023 12:34:56', 'DD-MM-YYYY HH24:MI:SS'),
                                TO_TIMESTAMP('11-03-2023 18:34:56', 'DD-MM-YYYY HH24:MI:SS'),100);
INSERT INTO trains (trainname,departure,destination,departuredate,departuretime,arrivaltime,seats)
                        VALUES ('MohakhaliExpress', 'mohakhali', 'mirpur',
                                to_date('11-03-2023','dd-mm-yyyy'),
                                TO_TIMESTAMP('2023-03-28 12:34:56', 'YYYY-MM-DD HH24:MI:SS'),
                                TO_TIMESTAMP('11-03-2023 18:34:56', 'DD-MM-YYYY HH24:MI:SS'),100);
select * from trains;









INSERT INTO users (username,usernid,useremail,userphone,userpassword)
                        VALUES ('1tahlil', '123', 'tahlilkfaiyaz@gmail.com', '019823213124', '123')
                        RETURNING username,usernid,useremail,userphone,userpassword;
INSERT INTO users (username,usernid,useremail,userphone,userpassword)
                        VALUES ('2tahlil', '1234', 'tahlilkfaiyaz@gmail.com', '019823213124', '123')
                        RETURNING username,usernid,useremail,userphone,userpassword;
INSERT INTO users (username,usernid,useremail,userphone,userpassword)
                        VALUES ('3tahlil', '12345', 'tahlilkfaiyaz@gmail.com', '019823213124', '123')
                        RETURNING username,usernid,useremail,userphone,userpassword;

delete from users;

insert into users(username,usernid,useremail,userphone)
values ('Tahlil', '123','ta@gmail.com','01782633834');

select * from student;

select * from users where useremail='ta@gmail.com';

select * from trains where departure='mohakhali' and destination='uttara' and departuredate='2023-03-11';

SELECT *
FROM reservation natural join trains natural join users
WHERE userid =6 order by reserve_time desc;

INSERT INTO trains (trainname,departure,destination,seats,departuredate,departuretime,arrivaltime)
            VALUES ($1, $2, $3,$4,$5,$6,$7)
            RETURNING trainname,departure,destination,seats,departuredate,departuretime,arrivaltime`,

select distinct (departure)from fares;











