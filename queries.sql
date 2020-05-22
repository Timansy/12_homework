use emp_tracker_db;

select c.ID, c.Title from
(select a.role_id as ID, a.role_title as Title, count(b.employee_id) as Emp_ID_Count 
from role_tbl as a
left join employee_tbl as b on a.role_id = b.role_id
group by ID) as c where c.Emp_ID_Count = 0;

select concat(c.ID,' | ',c.Title) as roles from  
    (select a.role_id as ID, a.role_title as Title, count(b.employee_id) as Emp_ID_Count 
    from role_tbl as a
    left join employee_tbl as b on a.role_id = b.role_id
    group by ID) as c where c.Emp_ID_Count = 0;


select concat(role_id,' | ',role_title) as roles from role_tbl order by role_title;

select concat(employee_id,' | ', first_name,' ', last_name) as managers from employee_tbl order by first_name;

select 
a.employee_id as ID
, concat(a.first_name," ", a.last_name) as Employee_Name
, b.role_title as Title
, b.salary as Salary
, c.department_name as Department 
, concat(d.first_name," ", d.last_name) as Manager_Name
from employee_tbl as a
inner join employee_tbl as d on a.manager_id = d.employee_id
inner join role_tbl as b on a.role_id = b.role_id
inner join department_tbl as c on b.department_id = c.department_id
order by ID
; 

select 
    a.employee_id as ID
    , concat(a.first_name," ", a.last_name) as Employee_Name
    , b.role_title as Title
    , b.salary as Salary
    , c.department_name as Department 
    , concat(d.first_name," ", d.last_name) as Manager_Name
    from employee_tbl as a
    inner join employee_tbl as d on a.manager_id = d.employee_id
    inner join role_tbl as b on a.role_id = b.role_id
    inner join department_tbl as c on b.department_id = c.department_id
    order by ID
    ; 

