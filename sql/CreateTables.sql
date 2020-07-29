-- Keep this 'users' table if you want to keep the basic login system
CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    username  varchar(50) NOT NULL,
    pass varchar(100) NOT NULL,
    email varchar(100) NOT NULL,
    primary key (id)
);
-- Start creating new tables below this line