DROP DATABASE IF EXISTS emp_tracker_db;
CREATE DATABASE emp_tracker_db;
USE emp_tracker_db;

CREATE TABLE department_tbl (
  department_id integer auto_increment not null
  , department_name varchar(100) not null
  , PRIMARY KEY (department_id) 
);

CREATE TABLE role_tbl (
  role_id integer auto_increment not null
  , role_title varchar(100) not null
  , salary decimal(13,2)
  , department_id integer
  , PRIMARY KEY (role_id) 
  , foreign key (department_id) references department_tbl(department_id)
);

CREATE TABLE employee_tbl (
  employee_id integer auto_increment not null
  , first_name varchar(30) not null
  , last_name varchar(30) not null
  , role_id integer
  , manager_id integer
  , PRIMARY KEY (employee_id) 
  , foreign key (role_id) references role_tbl(role_id)
  , foreign key (manager_id) references employee_tbl(employee_id)
);

insert into department_tbl(department_name) 
values 
('Operations')
, ('IT')
, ('HR')
, ('Legal')
, ('Executive')
, ('Marketing')
;

insert into role_tbl(role_title, salary, department_id)
values 
('HR Manager', 50000.00, 3)
, ('HR Employee', 30000.00, 3)
, ('HR Vice President', 80000.00, 3)
, ('OPS Manager', 50000.00, 1)
, ('OPS Employee', 30000.00, 1)
, ('OPS Vice President', 80000.00, 1)
, ('IT Manager', 50000.00, 2)
, ('IT Employee', 30000.00, 2)
, ('IT Vice President', 80000.00, 2)
, ('LGL Manager', 50000.00, 4)
, ('LGL Employee', 30000.00, 4)
, ('LGL Vice President', 80000.00, 4)
, ('CEO', 100000.00, 5)
;


insert into employee_tbl ( first_name, last_name, role_id, manager_id)
values
('Jane', 'Smith', 13, 1)
, ('Bob', 'Jones', 3, 1)
, ('Bob', 'Jones', 3, 1)
, ('Dee', 'Garret', 6, 1)
, ('Lee', 'Farret', 9, 1)
, ('Ree', 'Loppy', 12, 1)
;