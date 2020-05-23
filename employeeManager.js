var mysql = require("mysql");
var inquirer = require("inquirer");

let roles = [];
let removable_roles = [];
let managers = [];
let nonmanagers = [];
let departments = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "emp_tracker_db",
});

connection.connect(function (err) {
  if (err) throw err;
  getNonManagerArray();
  getManagerArray();
  getRoleArray();
  getDepartmentArray();
  getRemoveableRoleArray();
  listEmployees();
});

function runSearch() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: ["Add", "Modify", "Delete", "View"],
    })
    .then(function (answer) {
      if (answer.action === "View") {
        inquirer
          .prompt({
            name: "report",
            type: "list",
            message: "Which report would you like to view?",
            choices: [
              "Employees",
              "Managers",
              "Roles",
              "Departments",
              "Budget by Department",
            ],
          })
          .then(function (viewAnswers) {
            reportViewer(viewAnswers.report);
          });
      } else if (answer.action === "Add") {
        inquirer
          .prompt({
            name: "add",
            type: "list",
            message: "Which table would you like to add to?",
            choices: ["Employees", "Roles", "Departments"],
          })
          .then(function (viewAnswers) {
            addEntry(viewAnswers.add);
          });
      } else if (answer.action === "Modify") {
        inquirer
          .prompt({
            name: "modify",
            type: "list",
            message: "Which table would you like to modify?",
            choices: [
              "Employees",
              "Roles- NOT IMPLEMENTED",
              "Departments- NOT IMPLEMENTED",
            ],
          })
          .then(function (viewAnswers) {
            modifyEntry(viewAnswers.modify);
          });
      } else if (answer.action === "Delete") {
        inquirer
          .prompt({
            name: "delete",
            type: "list",
            message: "Which table would you like to delete?",
            choices: ["Employees", "Roles", "Departments - NOT IMPLEMENTED"],
          })
          .then(function (viewAnswers) {
            removeEntry(viewAnswers.delete);
          });
      }
    });
}

//viewing
function reportViewer(report) {
  var sqlString = "";
  switch (report) {
    case "Employees":
      sqlString = `select * from employee_tbl order by employee_id`;
      break;
    case "Managers":
      sqlString = `select 
      d.employee_id as Manager_ID
      , concat(d.first_name," ", d.last_name) as Manager_Name
      , a.employee_id as Employee_ID
      , concat(a.first_name," ", a.last_name) as Employee_Name
      from employee_tbl as a
      inner join employee_tbl as d on a.manager_id = d.employee_id
      inner join role_tbl as b on a.role_id = b.role_id
      inner join department_tbl as c on b.department_id = c.department_id
      order by Manager_ID
      ; `;
      break;
    case "Roles":
      sqlString = `select * from role_tbl order by role_id`;
      break;
    case "Departments":
      sqlString = `select * from department_tbl order by department_id`;
      break;
    case "Budget by Department":
      sqlString = `select a.department_name as Department, sum(b.salary) as Total_Salary 
      from department_tbl as a 
      inner join role_tbl as b on a.department_id = b.department_id
      group by Department;`;
      break;
  }
  connection.query(sqlString, (err, data) => {
    if (err) throw err;
    console.table(data);
    runSearch();
  });
}

//modifying
function modifyEntry(table) {
  switch (table) {
    case "Employees":
      updateEmployee();
      break;
    case "Roles- NOT IMPLEMENTED":
      listEmployees()  
    // updateRole();
      break;
    case "Departments- NOT IMPLEMENTED":
      listEmployees()  
    // console.log("function not implemented: " + table);
      // updateDepartment();
      break;
  }
  // console.log("modifyEntry: " + table);
  // console.log("function not implemented: " + table);
  // listEmployees();
}

function updateEmployee() {
  sqlString = `select * from employee_tbl order by employee_id`;
  connection.query(sqlString, (err, data) => {
    if (err) throw err;
    console.table(data);
    inquirer
      .prompt({
        name: "emp",
        type: "input",
        message: "Enter the id of the employee to modify",
      })
      .then(function (viewAnswers) {
        connection.query(
          `select * from employee_tbl where employee_id = ${parseInt(
            viewAnswers.emp
          )}`,
          (err, data) => {
            if (err) throw err;
            getUpdate(data, parseInt(viewAnswers.emp));
          }
        );
      });
  });
  function getUpdate(data, id) {
    inquirer
      .prompt([
        {
          name: "first",
          type: "input",
          message: "First name?",
          default: data[0].first_name,
        },
        {
          name: "last",
          type: "input",
          message: "Last name?",
          default: data[0].last_name,
        },
        {
          name: "role",
          type: "input",
          message: "Role ID?",
          default: data[0].role_id,
        },
        {
          name: "manager",
          type: "input",
          message: "Manager ID?",
          default: data[0].manager_id,
        }
      ])
      .then((updateAnswers) => {
        var querystr = `
                  update employee_tbl
                  set first_name = \"${updateAnswers.first}\", 
                    last_name = \"${updateAnswers.last}\", 
                    role_id = ${parseInt(updateAnswers.role)},
                    role_id = ${parseInt(updateAnswers.manager)} 
                  where employee_id = ${id};`;
        connection.query(querystr, (err) => {
          if (err) throw err;
          listEmployees();
        });
      });
  }
}

//removing

function removeEntry(table) {
  switch (table) {
    case "Employees":
      removeEmployee();
      break;
    case "Roles":
      removeRole();
      break;
    case "Departments - NOT IMPLEMENTED":
      console.log("function not implemented: " + table);
      listEmployees();
      break;
  }
  // console.log("removeEntry: " + table);
}

function removeEmployee() {
  inquirer
    .prompt({
      name: "delete",
      type: "list",
      message: "Select the ID of Employee to remove.",
      choices: nonmanagers,
    })
    .then(function (viewAnswers) {
      connection.query(
        `delete from employee_tbl where employee_id = ${parseInt(
          viewAnswers.delete.split("|")[0]
        )}`,
        (err, data) => {
          if (err) throw err;
          console.log(`${viewAnswers.delete} was deleted.`);
          listEmployees();
          getNonManagerArray();
        }
      );
    });
}

function removeRole() {
  // listRolesWithoutDependencies();
  inquirer
    .prompt({
      name: "delete",
      type: "list",
      message: "Roles without dependencies: Please select one",
      choices: removable_roles,
    })
    .then(function (viewAnswers) {
      connection.query(
        `delete from role_tbl where role_id = ${parseInt(
          viewAnswers.delete.split("|")[0]
        )}`,
        (err, data) => {
          if (err) throw err;
          console.log(`${viewAnswers.delete} was deleted.`);
          listRolesWithoutDependencies();
          getRemoveableRoleArray();
        }
      );
    });
}

//listing

function listRolesWithoutDependencies() {
  connection.query(
    `select c.ID, c.Title from
    (select a.role_id as ID, a.role_title as Title, count(b.employee_id) as Emp_ID_Count 
    from role_tbl as a
    left join employee_tbl as b on a.role_id = b.role_id
    group by ID) as c where c.Emp_ID_Count = 0;`,
    (err, data) => {
      if (err) throw err;
      console.table(data);
      runSearch();
    }
  );
}

function listEmployees() {
  connection.query(
    `select 
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
    ; `,
    (err, data) => {
      if (err) throw err;
      console.table(data);
      runSearch();
    }
  );
}

function listDepartments() {
  connection.query(
    `select * from department_tbl order by department_id`,
    (err, data) => {
      if (err) throw err;
      console.table(data);
      runSearch();
    }
  );
}

function listRoles() {
  connection.query(`select * from role_tbl order by role_id`, (err, data) => {
    if (err) throw err;
    console.table(data);
    runSearch();
  });
}

//Additions
function addEntry(table) {
  // console.log("addEntry: " + table);
  // console.log("reportViewer: " + table);
  switch (table) {
    case "Employees":
      addNewEmployee();
      break;
    case "Roles":
      addNewRole();
      break;
    case "Departments":
      addNewDepartment();
      break;
  }
}

function addNewEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeFirst",
        message: "First Name?",
      },
      {
        type: "input",
        name: "employeeLast",
        message: "Last Name?",
      },
      {
        type: "list",
        name: "role",
        message: "Role?",
        choices: roles,
      },
      {
        type: "list",
        name: "manager",
        message: "Manager?",
        choices: managers,
      },
    ])
    .then(function (answer) {
      pushEmployee(
        answer.employeeFirst,
        answer.employeeLast,
        parseInt(answer.role.split("|")[0]),
        parseInt(answer.manager.split("|")[0])
      );
      getManagerArray();
      listEmployees();
    });
}

function pushEmployee(first, last, role, manager) {
  console.log("Adding Employee");
  connection.query(
    `insert into employee_tbl ( first_name, last_name, role_id, manager_id)
        values
        (\"${first}\", \"${last}\", ${role}, ${manager})`,
    (err, data) => {
      if (err) throw err;
    }
  );
}

function addNewDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "New Department Name?",
      },
    ])
    .then(function (answer) {
      connection.query(
        `insert into department_tbl (department_name)
            values
            (\"${answer.department}\")`,
        (err, data) => {
          if (err) throw err;
        }
      );
      getDepartmentArray();
      listDepartments();
    });
}

function addNewRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "New Role Name?",
      },
      {
        type: "input",
        name: "salary",
        message: "Salary?",
      },
      {
        type: "list",
        name: "department",
        message: "Department?",
        choices: departments,
      },
    ])
    .then(function (answer) {
      connection.query(
        `insert into role_tbl (role_title, salary, department_id)
            values
            (\"${answer.role}\", \"${parseFloat(answer.salary)}\", \"${parseInt(
          answer.department.split("|")[0]
        )}\")`,
        (err, data) => {
          if (err) throw err;
        }
      );
      getRoleArray();
      listRoles();
    });
}

//Array Loading
function getManagerArray() {
  managers = [];
  connection.query(
    `select concat(c.ID,' | ',c.Name) as managers from  
    (select a.employee_id as ID, concat(a.first_name, " ", a.last_name) as Name, count(b.employee_id) as Emp_ID_Count 
    from employee_tbl as a
    left join employee_tbl as b on a.employee_id = b.manager_id
    group by ID) as c where c.Emp_ID_Count >= 0;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        managers.push(data[i].managers);
      }
    }
  );
}

function getNonManagerArray() {
  nonmanagers = [];
  connection.query(
    `select concat(c.ID,' | ',c.Name) as nonmanagers from  
    (select a.employee_id as ID, concat(a.first_name, " ", a.last_name) as Name, count(b.employee_id) as Emp_ID_Count 
    from employee_tbl as a
    left join employee_tbl as b on a.employee_id = b.manager_id
    group by ID) as c where c.Emp_ID_Count = 0;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        nonmanagers.push(data[i].nonmanagers);
      }
    }
  );
}

function getRoleArray() {
  roles = [];
  connection.query(
    `select concat(role_id,' | ',role_title) as roles from role_tbl order by role_title;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        roles.push(data[i].roles);
        // console.log(data[i].roles);
      }
    }
  );
}

function getRemoveableRoleArray() {
  removable_roles = [];
  connection.query(
    `select concat(c.ID,' | ',c.Title) as roles from  
    (select a.role_id as ID, a.role_title as Title, count(b.employee_id) as Emp_ID_Count 
    from role_tbl as a
    left join employee_tbl as b on a.role_id = b.role_id
    group by ID) as c where c.Emp_ID_Count = 0;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        removable_roles.push(data[i].roles);
        // console.log(data[i].roles);
      }
    }
  );
}

function getDepartmentArray() {
  departments = [];
  connection.query(
    `select concat(department_id,' | ',department_name) as department from department_tbl order by department;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        departments.push(data[i].department);
        // console.log(data[i].roles);
      }
    }
  );
}
