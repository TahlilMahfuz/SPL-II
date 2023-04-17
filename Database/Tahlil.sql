-- SMETRO
drop table users;

create table users(
    userid serial primary key,
    Username varchar(100),
    userNID varchar(100),
    useremail varchar(100),
    userphone varchar(100),
    userpassword varchar(300),
    userbalance int default 1000,
    reg_date date not null default current_timestamp
);
alter table users add userbalance int default 1000;
update users set userbalance=10;
select * from users;

update users set userbalance=userbalance-100 where userid=1;


drop table reservation;
drop table trains;

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
    avaiability smallint default 1,
    qr_code bytea, -- new column to store QR code image data
    reserve_time date not null default current_timestamp,
    FOREIGN KEY (trainid) REFERENCES trains(trainid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

select * from reservation;

select * from trains;

drop table fares;

create table fares(
    fareid serial primary key,
    departure varchar(100),
    destination varchar(100),
    amount double precision
);
select * from fares;

select amount from trains natural join fares where trainid=1;
update users set userbalance=userbalance-$1 where userid=$2;

select departure,destination from reservation natural join trains
where userid=$1;




drop table admins;

create table admins(
    adminid serial primary key,
    adminname varchar(100),
    adminNID varchar(100),
    adminemail varchar(100),
    adminphone varchar(100),
    adminpassword varchar(300),
    reg_date date not null default current_timestamp
);
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











