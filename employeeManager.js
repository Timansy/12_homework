var mysql = require("mysql");
var inquirer = require("inquirer");

let roles = [];
let managers = [];
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
  getManagerArray();
  getRoleArray();
  getDepartmentArray();
  listEmployees();
});

function reportViewer(report) {
  var sqlString = "";
  console.log("reportViewer: " + report);
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

function addEntry(table) {
  console.log("addEntry: " + table);
  console.log("reportViewer: " + table);
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

function modifyEntry(table) {
  console.log("modifyEntry: " + table);
}

function removeEntry(table) {
  console.log("removeEntry: " + table);
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

function listDepartments(){
  connection.query(
    `select * from department_tbl order by department_id`,
    (err, data) => {
      if (err) throw err;
      console.table(data);
      runSearch();
    }
  );
}

function listRoles(){
  connection.query(
    `select * from role_tbl order by role_id`,
    (err, data) => {
      if (err) throw err;
      console.table(data);
      runSearch();
    }
  );
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
            message: "Which table would you like to add to?",
            choices: ["Employees", "Roles", "Departments"],
          })
          .then(function (viewAnswers) {
            modifyEntry(viewAnswers.modify);
          });
      } else if (answer.action === "Delete") {
        inquirer
          .prompt({
            name: "delete",
            type: "list",
            message: "Which table would you like to add to?",
            choices: ["Employees", "Roles", "Departments"],
          })
          .then(function (viewAnswers) {
            removeEntry(viewAnswers.delete);
          });
      }
    });
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

function addNewDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "New Department Name?",
      }
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
            (\"${answer.role}\", \"${parseFloat(answer.salary)}\", \"${parseInt(answer.department.split("|")[0])}\")`,
        (err, data) => {
          if (err) throw err;
        }
      );
      getRoleArray();
      listRoles();
    });
}

function getManagerArray() {
  managers = [];
  connection.query(
    `select concat(employee_id,' | ', first_name,' ', last_name) as managers from employee_tbl order by first_name;`,
    (err, data) => {
      if (err) throw err;
      for (var i = 0; i < data.length; i++) {
        managers.push(data[i].managers);
        // console.log(data[i].roles);
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

function multiSearch() {
  var query = "SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1";
  connection.query(query, function (err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].artist);
    }
    runSearch();
  });
}

function rangeSearch() {
  inquirer
    .prompt([
      {
        name: "start",
        type: "input",
        message: "Enter starting position: ",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
      {
        name: "end",
        type: "input",
        message: "Enter ending position: ",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        },
      },
    ])
    .then(function (answer) {
      var query =
        "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
      connection.query(query, [answer.start, answer.end], function (err, res) {
        for (var i = 0; i < res.length; i++) {
          console.log(
            "Position: " +
              res[i].position +
              " || Song: " +
              res[i].song +
              " || Artist: " +
              res[i].artist +
              " || Year: " +
              res[i].year
          );
        }
        runSearch();
      });
    });
}

function songSearch() {
  inquirer
    .prompt({
      name: "song",
      type: "input",
      message: "What song would you like to look for?",
    })
    .then(function (answer) {
      console.log(answer.song);
      connection.query(
        "SELECT * FROM top5000 WHERE ?",
        { song: answer.song },
        function (err, res) {
          console.log(
            "Position: " +
              res[0].position +
              " || Song: " +
              res[0].song +
              " || Artist: " +
              res[0].artist +
              " || Year: " +
              res[0].year
          );
          runSearch();
        }
      );
    });
}

function songAndAlbumSearch() {
  inquirer
    .prompt({
      name: "artist",
      type: "input",
      message: "What artist would you like to search for?",
    })
    .then(function (answer) {
      var query =
        "SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ";
      query +=
        "FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
      query +=
        "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

      connection.query(query, [answer.artist, answer.artist], function (
        err,
        res
      ) {
        console.log(res.length + " matches found!");
        for (var i = 0; i < res.length; i++) {
          console.log(
            i +
              1 +
              ".) " +
              "Year: " +
              res[i].year +
              " Album Position: " +
              res[i].position +
              " || Artist: " +
              res[i].artist +
              " || Song: " +
              res[i].song +
              " || Album: " +
              res[i].album
          );
        }

        runSearch();
      });
    });
}
