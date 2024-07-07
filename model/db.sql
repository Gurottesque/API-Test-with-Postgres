
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TXT NOT NULL UNIQUE,
    passwd TEXT NOT NULL
);

CREATE TABLE section (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    FOREIGN KEY (section_id) REFERENCES section(id)
);