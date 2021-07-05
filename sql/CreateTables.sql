-- Keep this 'users' table if you want to keep the basic login system
CREATE TABLE users (
    id binary(16) default(UUID_TO_BIN(uuid())) NOT NULL,
    username  varchar(50) NOT NULL,
    pass varchar(100) NOT NULL,
    email varchar(100) NOT NULL,
    created datetime default CURRENT_TIMESTAMP NOT NULL,
    primary key (id)
);
-- Start creating new tables below this line