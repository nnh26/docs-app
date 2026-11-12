create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id),
  title text not null default 'Untitled document',
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table shares (
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id),
  primary key (document_id, user_id)
);

insert into users (name) values ('Alice'), ('Bob'), ('Carol');