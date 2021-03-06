const inquirer = require('inquirer');
const { connection } = require('./config/connection');
const orm = require('./config/orm')
const prompts = require('./config/prompts')

startApp();

//main function
function startApp() {
  inquirer
    .prompt(prompts.menu)
    .then(function (answer) {

      switch (answer.action) {
        case "Add departments, roles, employees":
          addDepRolesEmps();
          break;

        case "View departments, roles, employees":
          viewDepRolesEmps();
          break;

        case "Update employee roles":
          updateEmpRoles();
          break;

        case "Update employee managers":
          updateEmpManagers();
          break;

        case "View employees by manager ":
          viewEmpByManager();
          break;

        case "Delete departments, roles, and employees":
          deleteDepRolesEmps();
          break;

        case "View the total utilized budget of a department -- ie the combined salaries of all employees in that department":
          totalBudgetByDept();
          break;

        case "exit":
          connection.end();
          break;
      }
    });
}

// * View departments, roles, employees

function viewDepRolesEmps() {
  inquirer
    .prompt(prompts.viewDepts)
    .then(function (answer) {
      if (answer.do === 'exit') {
        startApp();
      }
      else {
        orm.findAll(answer.do, function (err, res) {
          if (err) {
            throw err
          }
          console.table(res);
          viewDepRolesEmps();
        })
      }
    });
};



//   * Add departments, roles, employees
function addDepRolesEmps() {
  inquirer
    .prompt(prompts.addMenu)
    .then(function (answer) {

      if (answer.do === 'exit') {
        startApp();
      }
      else if (answer.do === 'department') {
        addDB(answer.do, prompts.addDepartment)
      }
      else if (answer.do === 'role') {
        addDB(answer.do, prompts.addRole)
      }
      else if (answer.do === 'employee') {
        inquirer
          .prompt(
            [
              {
                name: "newEmpFirstName",
                type: "input",
                message: "Enter Emp first name"
              },
              {
                name: "newEmpLastName",
                type: "input",
                message: "Enter Emp last name"
              },
              {
                name: "newEmpRoleId",
                type: "input",
                message: "Enter role_id for new employee"
              },
              {
                name: "newEmpManagerId",
                type: "input",
                message: "Enter manager_id for new employee (if no manager enter 99)"
              }
            ]
          )

          .then(function (answer4) {

            connection.query(
              //I am getting error here when trying to add multiple values
              'INSERT INTO ?? (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)', [answer.do, answer4.newEmpFirstName, answer4.newEmpLastName, answer4.newEmpRoleId, answer4.newEmpManagerId], function (err, res) {
                if (err) {
                  throw err
                };
                console.log(`New employee ${answer4.newEmpFirstName} ${answer4.newEmpLastName} with role_id ${answer4.newEmpRoleId} and manager ${answer4.newEmpManagerId} was added`);
                addDepRolesEmps();

              })

          })


      }
    });
};

function addDB(table, questions) {
  inquirer
    .prompt(questions)
    .then(function (answer) {

      orm.create(table, answer, function (err, res) {
        if (err) {
          throw err
        };
        addDepRolesEmps();
      })
    })
}

// upd emp role

function updateEmpRoles() {
  inquirer
    .prompt({
      name: "updRole",
      type: "list",
      message: "What would you like to do?",
      choices: [
        // "List employees to update roles",
        "Update role for an employee",
        "exit"
      ]
    })

    .then(function (answer) {
      let listEmps = [];
      let listRoles = [];
      if (answer.updRole === 'Update role for an employee') {
        connection.query('SELECT employee.id, employee.first_name,employee.last_name,employee.role_id,role.title FROM employee LEFT JOIN role ON employee.role_id=role.id', function (err, res) {
          // console.table(res);
          // console.log(res)

          for (let i = 0; i < res.length; i++) {
            listEmps.push(`${res[i].first_name} ${res[i].last_name} ${res[i].id}`);
            listRoles.push(`${res[i].title} ${res[i].role_id}`)
          };


          if (err) {
            throw err
          };

          inquirer
            .prompt([{
              name: 'empToChoose',
              message: "Please select employee to update the role for",
              type: 'list',
              choices: listEmps
            },
            {
              name: 'roleToChoose',
              message: 'Select a new role',
              type: 'list',
              choices: listRoles
            }
            ])

            .then(function (answer) {
              let empIdChosen = answer.empToChoose.split(" ");
              let empChosen = empIdChosen[2];

              let roleIdChosen = answer.roleToChoose.split(" ");
              let roleChosen = roleIdChosen[1];
              // console.log(empChosen);
              // console.log(roleChosen)

              let sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
              connection.query(sql, [roleChosen, empChosen], function (err, res) {
                console.log(`Updated! ${empIdChosen[0]} ${empIdChosen[1]} is now ${roleIdChosen[0]}`);
                // console.log(res);
                updateEmpRoles();

              })

              // ---

            })

          //  updateEmpRoles();
        });

      }

      else if (answer.updRole === "exit") {
        startApp();
      }
    });


};

//upd emp manager ////////////////////////


function updateEmpManagers() {
  inquirer
    .prompt({
      name: "updManager",
      type: "list",
      message: "What would you like to do?",
      choices: [
        // "List employees to update manager",
        "Update manager for an employee",
        "exit"
      ]
    })

    .then(function (answer) {
      let listEmps = [];
      let listManagers = [];
      if (answer.updManager === "Update manager for an employee") {
        connection.query('SELECT employee.id, employee.first_name,employee.last_name,employee.role_id,employee.manager_id FROM employee', function (err, res) {
          // console.table(res);
          // console.log(res)

          for (let i = 0; i < res.length; i++) {

            listManagers.push(`${res[i].first_name} ${res[i].last_name} ${res[i].id}`);

            listEmps.push(`${res[i].first_name} ${res[i].last_name} ${res[i].id}`);

          };


          if (err) {
            throw err
          };

          inquirer
            .prompt([{
              name: 'empToChoose',
              message: "Please select employee to update the manager for",
              type: 'list',
              choices: listEmps
            },
            {
              name: 'managerToChoose',
              message: 'Select a new manager',
              type: 'list',
              choices: listManagers
            }
            ])

            .then(function (answer) {
              let empIdChosen = answer.empToChoose.split(" ");
              let empChosen = empIdChosen[2];

              let managerIdChosen = answer.managerToChoose.split(" ");
              let managerChosen = managerIdChosen[2];
              // console.log(empIdChosen);
              // console.log(managerChosen);

              let sql = 'UPDATE employee SET manager_id = ? WHERE id = ?';
              connection.query(sql, [managerChosen, empChosen], function (err, res) {
                console.log(`Updated! ${empIdChosen[0]} ${empIdChosen[1]} now has manager ${managerIdChosen[0]} ${managerIdChosen[1]}`);
                // console.log(res);
                updateEmpRoles();

              })



            })


        });

      }

      else if (answer.updManager === "exit") {
        startApp();
      }
    });


};




//view emps by manager ////////////////////////

function viewEmpByManager() {
  inquirer
    .prompt({
      name: "viewEmpByManager",
      type: "list",
      message: "What would you like to do?",
      choices: [

        "View employees by manager",
        "exit"
      ]
    })
    .then(function (answer) {

      if (answer.viewEmpByManager === "View employees by manager") {
        let sql = `SELECT CONCAT(m.first_name, ', ', m.last_name) AS Manager, CONCAT(e.first_name, ', ',e.last_name) AS Direct_Report FROM employee e INNER JOIN employee m ON m.id = e.manager_id ORDER BY Manager`;
        connection.query(sql, function (err, res) {

          // console.log(res);
          console.table(res);
          updateEmpRoles();
        })

      }

      else if (answer.viewEmpByManager === "exit") {
        startApp();
      }

    });

}




// Delete department / role / emp 


function deleteDepRolesEmps() {
  inquirer
    .prompt({
      name: "delMain",
      type: "list",
      message: "What would you like to do?",
      choices: [
        // "List employees to update roles",
        "Delete department",
        "Delete role",
        "Delete employee",
        "exit"
      ]
    })

    .then(function (answer) {
      let listEmps = [];
      let listRoles = [];
      let listDepts = [];


      if (answer.delMain === 'Delete department') {
        connection.query('SELECT department.id, department.name FROM department ORDER BY department.id', function (err, res) {
          // console.table(res);
          // console.log(res)

          for (let i = 0; i < res.length; i++) {
            listDepts.push(`${res[i].name} ${res[i].id}`);

          };


          if (err) {
            throw err
          };

          inquirer
            .prompt({
              name: 'deptToChoose',
              message: "Please select department to delete",
              type: 'list',
              choices: listDepts
            }
            )

            .then(function (answer) {
              let depData = answer.deptToChoose.split(" ");
              let deptIdChosen = depData[1];

              // console.log(deptIdChosen);

              let sql = 'DELETE FROM department WHERE id = ?;'


              connection.query(sql, [deptIdChosen], function (err, res) {
                console.log(`Updated! ${depData[0]} with ID ${depData[1]} was deleted`);
                // console.table(res);
                deleteDepRolesEmps();

              })

              // ---

            })

          //  updateEmpRoles();
        });

      }



      else if (answer.delMain === "Delete role") {
        connection.query('SELECT role.id, role.title, role.salary, role.department_id FROM role', function (err, res) {
          console.table(res);
          console.log(res)

          for (let i = 0; i < res.length; i++) {
            listRoles.push(`${res[i].title} ${res[i].id} ${res[i].salary} ${res[i].department_id}`);

          };


          if (err) {
            throw err
          };

          inquirer
            .prompt({
              name: 'roleToChoose',
              message: "Please select role to delete",
              type: 'list',
              choices: listRoles
            }
            )

            .then(function (answer) {
              let roleData = answer.roleToChoose.split(" ");
              let roleIdChosen = roleData[1];

              console.log(roleIdChosen);

              let sql = 'DELETE FROM role WHERE id = ?';
              connection.query(sql, [roleIdChosen], function (err, res) {
                console.log(`Updated! ${roleData[0]} with ID ${roleData[1]} was deleted`);

                deleteDepRolesEmps();

              })



            })


        });


      }


      else if (answer.delMain === "Delete employee") {
        connection.query('SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id FROM employee', function (err, res) {
          console.table(res);
          console.log(res)

          for (let i = 0; i < res.length; i++) {
            listEmps.push(`${res[i].id} ${res[i].first_name} ${res[i].last_name} ${res[i].role_id} ${res[i].manager_id}`);

          };


          if (err) {
            throw err
          };

          inquirer
            .prompt({
              name: 'empToChoose',
              message: "Please select employee to delete",
              type: 'list',
              choices: listEmps
            }
            )

            .then(function (answer) {
              let empData = answer.empToChoose.split(" ");
              let empIdChosen = empData[0];

              console.log(empIdChosen);

              let sql = 'DELETE FROM employee WHERE id = ?';
              connection.query(sql, [empIdChosen], function (err, res) {
                console.log(`Updated! ${empData[1]} ${empData[1]} with ID ${empData[0]} was deleted`);

                deleteDepRolesEmps();

              })



            })


        });


      }

      else if (answer.delMain === "exit") {
        startApp();
      }
    });


};



// total budget by dept
//View the total utilized budget of a department -- ie the combined salaries of all employees in that department

function totalBudgetByDept() {
              let listDepts = [];

            inquirer
                  .prompt({
                            name: "deptMain",
                            type: "list",
                            message: "What would you like to do?",
                            choices: [
                              "Select department to see combined budget",
                            "exit"
                            ]
                          })

     .then(function (answer) {
                              
              if(answer.deptMain==="Select department to see combined budget"){

                                        connection.query('SELECT * FROM department',function(err,res){
                                            console.log(res);
                                          if (err){
                                                      throw err
                                            }
                              
                                              for (let i=0;i<res.length;i++){
                                                listDepts.push(`${res[i].id} ${res[i].name}`)
                                              }

                                        inquirer
                                              .prompt({
                                                name: 'deptToViewSal',
                                                message: "Please select department to view salary",
                                                type: 'list',
                                                choices: listDepts
                                              }
                                              )

                                              .then(function (answer) {
                                                  let depData = answer.deptToViewSal.split(" ");
                                                  let deptIdChosen = depData[0];

                                                    // console.log(deptIdChosen);

                                                  let sql ='SELECT SUM(salary) AS "Total Salary" FROM employee WHERE employee.department_id =?;'

                                                    connection.query(sql, [deptIdChosen], function (err, res) {
                                                    console.log(res);
                                                    console.table(res);
                                                  
                                                    totalBudgetByDept();

                                          });

                        });
                  });
           }


                else if (answer.deptMain === 'exit'){
                      startApp();
                  };

     });
 };
