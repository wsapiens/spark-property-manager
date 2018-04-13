CREATE TABLE property_type (
  id bigserial primary key,
  name VARCHAR(40) not null
);

CREATE TABLE property (
  id bigserial primary key,
  type_id integer REFERENCES property_type (id),
  address_street text not null,
  address_city text not null,
  address_state text not null,
  address_zip text not null
);

CREATE TABLE property_unit (
  id bigserial primary key,
  property_id integer REFERENCES property (id),
  name text
);

CREATE TABLE rental_price (
  id bigserial primary key,
  unit_id integer REFERENCES property_unit (id),
  price numeric(2),
  time timestamp
);

CREATE TABLE property_tax (
  id bigserial primary key,
  property_id integer REFERENCES property (id),
  description text,
  amount numeric(2),
  time timestamp
);

CREATE TABLE work_order (
 id bigserial primary key,
 unit_id integer REFERENCES property_unit (id),
 description text not null,
 cost_estimation numeric(2),
 assignee_name text,
 assignee_phone text,
 assignee_email text,
 status text,
 scheduled_time timestamp,
 start_time timestamp,
 end_time timestamp
);

CREATE TABLE expense (
  id bigserial primary key,
  unit_id integer REFERENCES property_unit (id),
  description text,
  amount numeric(2)
);

CREATE TABLE work_order_expense (
  id bigserial primary key,
  work_id integer REFERENCES work_order (id),
  expense_id integer REFERENCES expense (id)
);

CREATE TABLE tenant (
  id bigserial primary key,
  unit_id integer REFERENCES property_unit (id),
  name text not null,
  phone text,
  email text
);

CREATE TABLE rental_income (
  id bigserial primary key,
  tenant_id integer REFERENCES tenant (id),
  method text,
  reference text,
  amount numeric(2),
  time timestamp
);
