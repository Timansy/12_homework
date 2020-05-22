# Unit 12 MySQL Homework: Employee Tracker

This was a fun exercise for this week's homework. We are asked to build a small application that would all users to add/modify/delete entries in an Employee Management database.

Whilst navigating input management VIA inquirer was a bit tedious (and frustrating when I could not get things to work as desired), I found the MySQL piece engaging, challenging and fun.

Rather than cover the ins and outs of how the program works, I thought I would use this readme file as a way to expose some of the more challenging queries I constructed. NOTE: If you do download this and run it, it is not fully implemented, but exceeded the requirements - I note in the execution which elements where not implemented.

## Challenging SQL - Set-up

Fortunately for me, I have a bit of experience in Transact-SQL. I honestly would have no idea how far I would make it without this. I am assuming that the instructors did not intend for us to implement relationships, thus making simple tasks like deleting a row impossible when a dependency exists.

They did provide us with the following

* **department**:

  * **id** - INT PRIMARY KEY
  * **name** - VARCHAR(30) to hold department name

* **role**:

  * **id** - INT PRIMARY KEY
  * **title** -  VARCHAR(30) to hold role title
  * **salary** -  DECIMAL to hold role salary
  * **department_id** -  INT to hold reference to department role belongs to

* **employee**:

  * **id** - INT PRIMARY KEY
  * **first_name** - VARCHAR(30) to hold employee first name
  * **last_name** - VARCHAR(30) to hold employee last name
  * **role_id** - INT to hold reference to role employee has
  * **manager_id** - INT to hold reference to another employee that manager of the current employee. This field may be null if the employee has no manager
  
I went ahead and implemented the tables with Foriegn Keys and all. As in the image they provided below.

![Database Schema](Assets/schema.png)

In the next section, I'll cover some of the complexities I encountered and how I resolved them.

## Challenging SQL - Challenges

### Listing Managers

Due to the fact that I had added a foreign key self-reference in the employee table, I needed to find a way to list the employee's for each manager by manager, here is how I did it. Please note that I am not a big CAPS fan - sorry to any purists out there.

```
select 
d.employee_id as Manager_ID
, concat(d.first_name," ", d.last_name) as Manager_Name
, a.employee_id as Employee_ID
, concat(a.first_name," ", a.last_name) as Employee_Name
from employee_tbl as a
inner join employee_tbl as d on a.manager_id = d.employee_id
inner join role_tbl as b on a.role_id = b.role_id
order by Manager_ID
;
```
Here is the result.
```
┌─────────┬────────────┬──────────────┬─────────────┬───────────────┐
│ (index) │ Manager_ID │ Manager_Name │ Employee_ID │ Employee_Name │
├─────────┼────────────┼──────────────┼─────────────┼───────────────┤
│    0    │     1      │ 'Jane Smith' │      1      │ 'Jane Smith'  │
│    1    │     1      │ 'Jane Smith' │      3      │  'Bob Jones'  │
│    2    │     1      │ 'Jane Smith' │      4      │ 'Dee Garret'  │
└─────────┴────────────┴──────────────┴─────────────┴───────────────┘
```
### Complete View

One thing I wanted to do with my application was display all the information avaliable as a blended table or view. To do this required an additional join from above. Here is how I implemented it in the code. 

```
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
```
Here is my result:

```
┌─────────┬────┬───────────────┬──────────────────────┬────────┬──────────────┬──────────────┐
│ (index) │ ID │ Employee_Name │        Title         │ Salary │  Department  │ Manager_Name │
├─────────┼────┼───────────────┼──────────────────────┼────────┼──────────────┼──────────────┤
│    0    │ 1  │ 'Jane Smith'  │        'CEO'         │ 100000 │ 'Executive'  │ 'Jane Smith' │
│    1    │ 3  │  'Bob Jones'  │ 'HR Vice President'  │ 80000  │     'HR'     │ 'Jane Smith' │
│    2    │ 4  │ 'Dee Garret'  │ 'OPS Vice President' │ 80000  │ 'Operations' │ 'Jane Smith' │
└─────────┴────┴───────────────┴──────────────────────┴────────┴──────────────┴──────────────┘
```

### Deleting Roles and Employees

Here is probably the most complex of the queries. I needed to find which roles did not have any dependencies, so I could safely delete the tuple. If I did not tune for this, attempting to delete would result in a dependency error. I basically wrap one select statement around the result of an initial select statement. 

Roles:
```
select concat(c.ID,' | ',c.Title) as roles from  
    (select a.role_id as ID, a.role_title as Title, count(b.employee_id) as Emp_ID_Count 
    from role_tbl as a
    left join employee_tbl as b on a.role_id = b.role_id
    group by ID) as c where c.Emp_ID_Count = 0;
```
Doing this allowed me to present a list of avalable roles to delete.
```
? Roles without dependencies: Please select one (Use arrow keys)
> 1 | HR Manager
  2 | HR Employee
  4 | OPS Manager
  5 | OPS Employee
  7 | IT Manager
  8 | IT Employee
  9 | IT Vice President
(Move up and down to reveal more choices)
```

And for Employees, I could not delete any employee who was a manager:
```
select concat(c.ID,' | ',c.Name) as nonmanagers from  
    (select a.employee_id as ID, concat(a.first_name, " ", a.last_name) as Name, count(b.employee_id) as Emp_ID_Count 
    from employee_tbl as a
    left join employee_tbl as b on a.employee_id = b.manager_id
    group by ID) as c where c.Emp_ID_Count = 0;
```

Which results in 

```
? Select the ID of Employee to remove. (Use arrow keys)
> 2 | Bob Jones
  3 | Bob Jones
  4 | Dee Garret
  5 | Lee Farret
  6 | Ree Loppy
```

Thanks for reading, Tim