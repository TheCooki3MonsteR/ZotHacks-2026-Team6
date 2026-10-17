-- Which user owns which sticker. A sticker is unlocked when its owner posts a review
-- for that fountain (see POST /api/fountains/{id}/reviews in the backend).
create table if not exists user_collectibles (
    user_id        bigint      not null references users(user_id)                on delete cascade,
    collectible_id bigint      not null references collectibles(collectible_id)  on delete cascade,
    obtained_at    timestamptz not null default now(),
    primary key (user_id, collectible_id)
);

create index if not exists idx_user_collectibles_user on user_collectibles (user_id, obtained_at desc);

-- Ownership is private: lock the table to the public API. The FastAPI backend connects as
-- the database owner, so it is not affected by row level security.
alter table user_collectibles enable row level security;
