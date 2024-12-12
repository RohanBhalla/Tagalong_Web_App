-- drop database if exists tagalong
-- create database tagalong

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE Users (
    firstName       VARCHAR(35),
    lastName        VARCHAR(35),
    email           VARCHAR(50) NOT NULL UNIQUE,
    username        VARCHAR(50) PRIMARY KEY,
    password        VARCHAR(64) NOT NULL,
    userAddress     VARCHAR(255),
    userCoordinates geography(POINT,4326),
    profilePic      VARCHAR(255) DEFAULT 'default.jpg',
    userDescription TEXT DEFAULT 'a mysterious person...'
);

CREATE TABLE Events (
    eventId             SERIAL PRIMARY KEY,
    eventTitle          VARCHAR(100) NOT NULL,
    host                VARCHAR(50) NOT NULL,
    eventDescription    TEXT,
    dateTime            TIMESTAMP,
    eventAddress        VARCHAR(255),
    eventCoordinates    geography(POINT,4326),
    eventCapacity       INTEGER,
    category            VARCHAR(100) CHECK (category IN (
        'Sports',
        'Gaming',
        'Social',
        'Food',
        'DIY and Crafts',
        'Educational',
        'Cultural',
        'Music and Entertainment',
        'Outdoor and Adventure',
        'Volunteering and Community Service',
        'Entrepreneurship and Business',
        'Technology and Science',
        'Wellness and Health',
        'Environmental and Sustainability',
        'Arts and Literature',
        'Fashion and Beauty',
        'Travel and Exploration',
        'Film and Media',
        'Comedy and Humor',
        'Dance and Performance',
        'Miscellaneous'
    )),
    CONSTRAINT host_fk
        FOREIGN KEY (host)
        REFERENCES Users (username)
        ON DELETE CASCADE
);

CREATE TABLE Joined (
    eventId     INTEGER NOT NULL,
    username    VARCHAR(50) NOT NULL,
    attended    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (eventId, username),
    CONSTRAINT event_fk
        FOREIGN KEY (eventId)
        REFERENCES Events(eventId)
        ON DELETE CASCADE,
    CONSTRAINT user_fk 
        FOREIGN KEY (username) 
        REFERENCES Users (username)
        ON DELETE CASCADE
);

CREATE TABLE Announcements (
    announcementId  SERIAL PRIMARY KEY,
    eventId         INTEGER DEFAULT NULL,
    aContent        TEXT,
    CONSTRAINT event_fk
        FOREIGN KEY (eventId)
        REFERENCES Events (eventId)
        ON DELETE CASCADE
);

CREATE TABLE SentAnnouncements (
    sentId          SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL,
    announcementId  INTEGER NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    seen            BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT user_fk 
        FOREIGN KEY (username) 
        REFERENCES Users (username)
        ON DELETE CASCADE,
    CONSTRAINT announcement_fk
        FOREIGN KEY (announcementId)
        REFERENCES announcements(announcementId)
        ON DELETE CASCADE
);

-- A new table simplifying relationship management (Blocked and Friend combine into one)
CREATE TABLE Relationships (
    username        VARCHAR(50) NOT NULL,
    other           VARCHAR(50) NOT NULL,
    relation        VARCHAR(50) CHECK (Relation IN ('friend', 'blocked')),
    PRIMARY KEY (username, other),
    CONSTRAINT user_fk 
        FOREIGN KEY (username) 
        REFERENCES Users (username)
        ON DELETE CASCADE,
    CONSTRAINT other_fk
        FOREIGN KEY (other)
        REFERENCES Users (username)
        ON DELETE CASCADE
);


-- sample code for generating test database TODO
/* 

INSERT INTO Users (firstName, lastName, email, username, password, userAddress, userCoordinates, profilePic, userDescription)
*/


-- INSERTING PEOPLE 
INSERT INTO Users (firstName, lastName, email, username, password, userAddress, userCoordinates, profilePic, userDescription)

VALUES
('John', 'Doe', 'john.doe@example.com', 'johndoe', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '123 Main St, City', ST_SetSRID(ST_MakePoint(-73.97, 40.77), 4326), 'default.jpg', 'A friendly person.'),

('Alice', 'Smith', 'alice.smith@example.com', 'alicesmith', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-73.986839, 40.69417), 4326), 'default.jpg', 'Loves reading and art.'),

('Nathan', 'Smith', 'ns@example.com', 'smity', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-73.986839, 40.69417), 4326), 'nate.jpg', 'Finance and Fitness Enthusiast.'),

('Rohan', 'Bhalla', 'rb5015@nyu.edu', 'killavanilla1', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-73.986839, 40.69417), 4326), 'rohan.jpg', 'Film Enthusiast.'),

('Berry', 'Liu', 'bl@example.edu', 'klikbait', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-73.986839, 40.69417), 4326), 'berry.jpg', 'Avid Manga Reader and Top Golf Expert'),

('Jeff', 'Liu', 'jl@example.edu', 'jet', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-73.986839, 40.69417), 4326), 'jeff.jpg', 'Food around NYC'),

('Matthew', 'Broderick', 'mb@example.edu', 'mattbro', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'Broadway and theater nerd'),

('Grace', 'Kelly', 'gk@example.edu', 'RealGraceKelly', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'Fashion and Arts'),

('Cary', 'Grant', 'cg@example.edu', 'carygrant', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '456 Oak St, City', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'I enjoy the finer things in life'),

('Larry', 'Bird', 'lb@example.edu', 'larryb', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '456 Oak St, City', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'Basketball and sports fan'),

('Roger', 'Moore', 'rm@example.edu', 'rogerroger', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '456 Oak St, City', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'Movies and Horse Riding'),

('Margot', 'Robbie', 'margot@example.edu', 'margotrob', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '456 Oak St, City', ST_SetSRID(ST_MakePoint(-74.01, 40.73), 4326), 'default.jpg', 'See what all NYC has to offer'),

('Rachel', 'Green', 'rachel@example.edu', 'rachelg', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Heral Sq, New York', ST_SetSRID(ST_MakePoint(-73.9895, 40.7507), 4326), 'default.jpg', 'Coffe and Shopping addict'),

('Ross', 'Geller', 'ross@example.edu', 'rossg', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Midtown, New York', ST_SetSRID(ST_MakePoint(-74.0079, 40.7135), 4326), 'default.jpg', 'Paleontologist and Divorce Enthusiast'),

('Monica', 'Geller', 'monica@example.edu', 'monicag', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Another Address, New York', ST_SetSRID(ST_MakePoint(-73.9885, 40.7305), 4326), 'default.jpg', 'Chef and Obsessive Cleaner'),

('Joey', 'Tribbiani', 'joey@example.edu', 'joeyt', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Yet Another Address, New York', ST_SetSRID(ST_MakePoint(-74.0060, 40.7358), 4326), 'default.jpg', 'Actor with a Love for Pizza'),

('Phoebe', 'Buffay', 'phoebe@example.edu', 'phoebeb', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Some Magical Place, New York', ST_SetSRID(ST_MakePoint(-73.9857, 40.7280), 4326), 'default.jpg', '(Aspiring) Singer-Songwriter'),

('Chandler', 'Bing', 'chandler@example.edu', 'chandlerb', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Yet Another Address, New York', ST_SetSRID(ST_MakePoint(-73.9967, 40.7327), 4326), 'default.jpg', 'Sarcastic Office Worker'),

('Jerry', 'Seinfeld', 'seinfeld@example.edu', 'jerry', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Union Square, New York', ST_SetSRID(ST_MakePoint(-73.9878, 40.7355), 4326), 'default.jpg', 'Comedy clubs, cars, and Coffee'),

('Cosmo', 'Kramer', 'cosmo@example.com', 'kramer', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Apartment 5B, New York', ST_SetSRID(ST_MakePoint(-73.9936, 40.7316), 4326), 'default.jpg', 'Eccentric person with Unique Ventures'),

('Elaine', 'Benes', 'elaine@example.com', 'elaineb', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Apartment 5A, New York', ST_SetSRID(ST_MakePoint(-73.9936, 40.7316), 4326), 'default.jpg', 'Professional and Quirky'),

('George', 'Costanza', 'george@example.com', 'georgec', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Apartment 5B, New York', ST_SetSRID(ST_MakePoint(-73.9936, 40.7316), 4326), 'default.jpg', 'Nothing better than Bosco Syrup. Studying Architect with an interest in Marine Biology'),

('Newman', 'Newman', 'newman@example.com', 'newman', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Some Postal Route, New York', ST_SetSRID(ST_MakePoint(-73.9977, 40.7589), 4326), 'default.jpg', 'Postal Worker with a Grudge');


-- INSERTING RELATIONSHIPS

INSERT INTO Relationships (username, other, relation)
-- Will be using smity's account to demo because of ties to the different subgroups
-- Subgroup between killavanilla1, smity, jet, and klikbait (making smity friends with them all)
VALUES 
('smity', 'killavanilla1', 'friend'),
('killavanilla1', 'smity', 'friend'),
('smity', 'jet', 'friend'),
('jet', 'smity', 'friend'),
('smity', 'klikbait', 'friend'),
('klikbait', 'smity', 'friend'),
('killavanilla1', 'jet', 'friend'),
('killavanilla1', 'klikbait', 'friend'),

-- Another subgroup between 2 way friendships between ross, monica, joey, chandler, rachel, phoebe and another with smity
-- Smith is following all people from this subgroup that have an event
('joeyt', 'chandlerb', 'friend'),
('chandlerb', 'joeyt', 'friend'),
('rossg', 'monicag', 'friend'),
('monicag', 'rossg', 'friend'),
('rossg', 'chandlerb', 'friend'),
('chandlerb', 'rossg', 'friend'),
('monicag', 'rachelg', 'friend'),
('rachelg', 'monicag', 'friend'),
('phoebeb', 'rachelg', 'friend'),
('rachelg', 'phoebeb', 'friend'),
('joeyt', 'phoebeb', 'friend'), 
('phoebeb', 'joeyt', 'friend'),
('smity', 'rachelg', 'friend'),
('rachelg', 'smity', 'friend'),
('smity', 'monicag', 'friend'),
('smity', 'rossg', 'friend'),
('smity', 'joeyt', 'friend'),



-- Seinfeld subgroup between elaineb, georcec, jerry. Jerry has blocked newman. Added friendship bothways between smity and jerry
('jerry', 'georgec', 'friend'),
('jerry', 'elaineb', 'friend'),
('jerry', 'kramer', 'friend'),
('jerry', 'newman', 'blocked'),
('georgec', 'elaineb', 'friend'),
('kramer', 'newman', 'friend'),
('jerry', 'smity', 'friend'),
('smity', 'jerry', 'friend'),
('smity', 'newman', 'friend'),
('newman', 'smity', 'friend');











-- INSERTING EVENTS
-- Smity is hosting 1 and joining 2 events

INSERT INTO Events (eventTitle, host, eventDescription, dateTime, eventAddress, eventCoordinates, eventCapacity, category)
VALUES 
('Tag-along to Union Square Holiday market', 'killavanilla1', 'Join us for a festive day at the holiday market!', '2023-12-20', 'E 14th St, New York, NY 10011', ST_SetSRID(ST_MakePoint(-73.9878, 40.7355), 4326), 10, 'Food'),

('Looking for people going to Drake and J-Cole at MSG!!!', 'jet', 'As big as the superbowl', '2024-01-14', '4 Pennsylvania Plaza, New York, NY 10001', ST_SetSRID(ST_MakePoint(-73.9935, 40.7506), 4326), 10, 'Music and Entertainment'),

('F.R.I.E.N.D.L.Y Potluck after Finals Week', 'monicag', 'Join us for a delicious potluck after finals!', '2024-01-14', '130 E 25th St, New York, NY 10010', ST_SetSRID(ST_MakePoint(-73.9885, 40.7305), 4326), 20, 'Food'),

('Michael B Jordan Q&A Session at NYFF', 'smity', 'Join us for an exciting Q&A session with Michael B Jordan!', '2024-01-02', '10 Columbus Cir, New York, NY 10019', ST_SetSRID(ST_MakePoint(-73.9819, 40.7681), 4326), 4, 'Music and Entertainment'),

('Free Standup Event Happening Soon', 'jerry', 'Join us for a night of laughter with Jerry Seinfeld!', '2023-12-15', '1568 2nd Ave, New York, NY 10028', ST_SetSRID(ST_MakePoint(-73.9668, 40.7736), 4326), 30, 'Comedy and Humor'),

('Risk Board Game (Game Night)', 'newman', 'Join Newman for an intense game of Risk!', '2023-12-14', '625 W 57th St, New York, NY 10019', ST_SetSRID(ST_MakePoint(-73.9977, 40.7589), 4326), 3, 'Gaming'),

('Tagalong to Smorgasburg', 'klikbait', 'Join us for a food-filled adventure at Smorgasburg!', '2024-02-20', 'P33G+7F, Brooklyn, NY 11237', ST_SetSRID(ST_MakePoint(-73.9616, 40.7221), 4326), 7, 'Food'),
-- Capacity for rock climbing is 1, have berry join it, then Smity tries and can't get in
('1 Free Rock Climbing Pass', 'jet', 'Join me for a thrilling rock climbing experience!', '2023-12-27', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-74.006, 40.7128), 4326), 1, 'Outdoor and Adventure'),

('Foosball Tournament', 'joeyt', 'Join Joey for an exciting foosball tournament!', '2024-01-01', '6 MetroTech Center, Brooklyn, NY 11201', ST_SetSRID(ST_MakePoint(-74.0060, 40.7358), 4326), 4, 'Sports'),

('Tagalong to Museum of Natural History', 'rossg', 'Join Me for a fascinating tour of the Museum of Natural History!', '2023-12-30', '200 Central Park West, New York, NY ', ST_SetSRID(ST_MakePoint(-73.9749, 40.7813), 4326), 10, 'Educational'),

-- Long distance away event (across the world)
('Checking out Cafes near the Eiffel Tower', 'rachelg', 'Join me for a cafe exploration near the Eiffel Tower!', '2023-12-25', 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France', ST_SetSRID(ST_MakePoint(2.2945, 48.8588), 4326), 3, 'Travel and Exploration'),
-- Anohter Long distance event
('Best Butter Chicken in the World', 'killavanilla1', 'Join me for a culinary adventure with the best butter chicken!', '2024-01-25 14:00:00', '3704, Netaji Subhash Marg, Old Dariya Ganj, Daryaganj, New Delhi, Delhi, 110002, India', ST_SetSRID(ST_MakePoint(77.2300, 28.6139), 4326), 15, 'Food');





-- INSERTING into Joined

-- JOINING MONICA'S EVENT ---------------------------
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'rossg' AND eventTitle = 'Tagalong to Museum of Natural History'), 'chandlerb', FALSE);

-- Chandler joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'chandlerb', FALSE);

-- Smity joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'smity', FALSE);

-- Ross joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'rossg', FALSE);

-- Rachel joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'rachelg', FALSE);

-- Phoebe joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'phoebeb', FALSE);

-- Joey joining Monica's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'joeyt', FALSE);

-- --------------------------------------------
-- Joining Seinfeld's event

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'jerry' AND eventTitle = 'Free Standup Event Happening Soon'), 'smity', FALSE);

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'jerry' AND eventTitle = 'Free Standup Event Happening Soon'), 'kramer', FALSE);

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'jerry' AND eventTitle = 'Free Standup Event Happening Soon'), 'elaineb', FALSE);

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'jerry' AND eventTitle = 'Free Standup Event Happening Soon'), 'georgec', FALSE);

-- Joining Smity's event
INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'smity' AND eventTitle = 'Michael B Jordan Q&A Session at NYFF'), 'killavanilla1', FALSE);

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'smity' AND eventTitle = 'Michael B Jordan Q&A Session at NYFF'), 'jet', FALSE);

INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'smity' AND eventTitle = 'Michael B Jordan Q&A Session at NYFF'), 'klikbait', FALSE);


INSERT INTO Joined (eventId, username, attended)
VALUES
((SELECT eventId FROM Events WHERE host = 'jet' AND eventTitle = '1 Free Rock Climbing Pass'), 'klikbait', FALSE);

-- INSERTING Announcements 
INSERT INTO Announcements (eventId, aContent)
VALUES
((SELECT eventId FROM Events WHERE host = 'monicag' AND eventTitle = 'F.R.I.E.N.D.L.Y Potluck after Finals Week'), 'Sorry! Forgot to specify the time for the potluck- starting at 7:00pm! See you guys there!');

-- INSERTING SentAnnouncements
INSERT INTO SentAnnouncements (username, announcementId)
VALUES
('chandlerb', 1),
('smity', 1),
('rossg', 1),
('rachelg', 1),
('phoebeb', 1),
('joeyt', 1);