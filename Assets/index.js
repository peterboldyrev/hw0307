const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
  
    password: "password",
    database: "empTrackerDb"
});

// general entry point to the app
connection.connect(function(err){
    if (err) throw err;
    // console.log('working');
    startApp();
   
});


//main function
function startApp() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "Add departments, roles, employees",
          "View departments, roles, employees",
          "Update employee roles",
          "Update employee managers",
          "View employees by manager ",
          "Delete departments, roles, and employees",
          "View the total utilized budget of a department -- ie the combined salaries of all employees in that department",
          "exit"
        ]
      })
      .then(function(answer) {
        
        switch (answer.action) {
        case "Add departments, roles, employees":
          addDepRolesEmps();
          break;
  
        case "View departments, roles, employees":
          viewDepRolesEmps();
          break;
  
        case  "Update employee roles":
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

function viewDepRolesEmps(){
    inquirer
            .prompt ({
              name: "do",
              type: "list",
              message: "What would you like to view?",
              choices: [
                    "department",
                    "role",
                    "employee",
                    //add about all
                    "exit"
                    ]

            })

            .then(function(answer){
                    if(answer.do==='exit'){
                     startApp();
                    }

                    else {
                        connection.query('SELECT * FROM ??',`${answer.do}`, function(err,res){
                                    if(err) {
                                    throw err
                                }
                                  console.table(res);
                                    viewDepRolesEmps();
                                    
                                            
                        });
                    }
           

            });


};


//   * Add departments, roles, employees



function addDepRolesEmps(){
      inquirer
                .prompt ({
                  name: "do",
                  type: "list",
                  message: "What would you like to add?",
                  choices: [
                        "department",
                        "role",
                        "employee",
                        "exit"
                        ]

                })

                .then(function(answer){

                  if(answer.do==='exit'){
                    startApp();
                    
                   }

                   else if(answer.do=== 'department')
                    {
                            inquirer
                              .prompt(
                                {
                                name: "newDepName",
                                type: "input",
                                message: "Enter dept Name"
                                }
                              )
                            
                              .then(function(answer2){
                                
                                connection.query(
                                  'INSERT INTO ?? (name) VALUES (?)',[answer.do, answer2.newDepName], function(err,res){
                                          if(err) {
                                            throw err
                                          };
                                       
                                          console.log(`Department ${answer2.newDepName} was added!`);
                                          addDepRolesEmps();
                                         
                              })

                              })

                              
                  }

                  else if(answer.do === 'role')
                  
                  {
                            inquirer
                            .prompt(
                              [
                              {
                              name: "newRoleName",
                              type: "input",
                              message: "Enter role title"
                              },
                              {name: "newRoleSalary",
                              type: "input",
                              message: "Enter role salary"
                              },
                              {name: "newRoleDeptId",
                              type: "input",
                              message: "Enter dept_id associated with this role"
                              }
                            ]
                            )
                          
                            .then(function(answer3){
                              // console.log(answer.do);
                                                           
                              connection.query(
                                //I was getting error here when trying to add multiple values
                                'INSERT INTO ?? (title,salary,department_id) VALUES (?,?,?)',[answer.do,answer3.newRoleName,answer3.newRoleSalary,answer3.newRoleDeptId], function(err,res){
                                        if(err) {
                                          throw err
                                        };
                                        console.log(`Role ${answer3.newRoleName} with salary ${answer3.newRoleSalary} and department_id ${answer3.newRoleDeptId} added!`);
                                        addDepRolesEmps();
                                       
                            })

                            })

                    
                  }


                  else if(answer.do === 'employee')
                  
                  {
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
                              {name: "newEmpRoleId",
                              type: "input",
                              message: "Enter role_id for new employee"
                              },
                              {name: "newEmpManagerId",
                              type: "input",
                              message: "Enter manager_id for new employee (if no manager enter 99)"
                              }
                            ]
                            )
                          
                            .then(function(answer4){
                              
                              connection.query(
                                //I am getting error here when trying to add multiple values
                                'INSERT INTO ?? (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)',[answer.do, answer4.newEmpFirstName,answer4.newEmpLastName,answer4.newEmpRoleId,answer4.newEmpManagerId], function(err,res){
                                        if(err) {
                                          throw err
                                        };
                                        console.log(`New employee ${answer4.newEmpFirstName} ${answer4.newEmpLastName} with role_id ${answer4.newEmpRoleId} and manager ${answer4.newEmpManagerId} was added`);
                                        addDepRolesEmps();
                                        
                            })

                            })

                    
                  }
                

              
                              

              });
};



// upd emp role

 function updateEmpRoles(){
  inquirer
            .prompt ({
              name: "updRole",
              type: "list",
              message: "What would you like to do?",
            choices: [
                  // "List employees to update roles",
                  "Update role for an employee",
                  "exit"
                  ]
            })

            .then(function(answer){
             let listEmps =[];
             let listRoles =[];
                  if(answer.updRole ==='Update role for an employee'){
                        connection.query ('SELECT employee.id, employee.first_name,employee.last_name,employee.role_id,role.title FROM employee LEFT JOIN role ON employee.role_id=role.id',function(err,res){
                          console.table(res);
                          console.log(res)
                          
                          for (let i=0;i<res.length;i++){
                            listEmps.push(`${res[i].first_name} ${res[i].last_name} ${res[i].id}`);
                            listRoles.push(`${res[i].title} ${res[i].role_id}`)
                           };
                           
                         
                                          if(err) {
                                                  throw err
                                                };
                              
                                                inquirer
                                                  .prompt([{
                                                    name: 'empToChoose',
                                                    message: "Please select employee to update the role for",
                                                    type:'list',
                                                    choices:listEmps
                                                  },
                                                  {
                                                    name: 'roleToChoose',
                                                    message: 'Select a new role',
                                                    type:'list',
                                                    choices:listRoles
                                                  }
                                                ])
                                                
                                                .then(function(answer){
                                                  let empIdChosen = answer.empToChoose.split(" ");
                                                  let empChosen = empIdChosen[2];
                                                  
                                                  let roleIdChosen = answer.roleToChoose.split(" ");
                                                  let roleChosen = roleIdChosen[1];
                                                  console.log(empChosen);
                                                  console.log(roleChosen)
                                                 
                                                  let sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
                                                    connection.query(sql,[roleChosen,empChosen],function(err,res){
                                                        console.log(`Updated! ${empIdChosen[0]} ${empIdChosen[1]} is now ${roleIdChosen[0]}`);
                                                        // console.log(res);
                                                        updateEmpRoles();
                                                          
                                                      })
                                                   
                                                  // ---

                                                })  
                                               
                                                //  updateEmpRoles();
                                              });
                                      
                  }

                else if(answer.updRole ==="exit"){
                  startApp();
                }
            });
            

};




// upd emp manager 



 function updateEmpRoles(){
  inquirer
            .prompt ({
              name: "updRole",
              type: "list",
              message: "What would you like to do?",
            choices: [
                  // "List employees to update roles",
                  "Update role for an employee",
                  "exit"
                  ]
            })

            .then(function(answer){
             let listEmps =[];
             let listRoles =[];
                  if(answer.updRole ==='Update role for an employee'){
                        connection.query ('SELECT employee.id, employee.first_name,employee.last_name,employee.role_id,role.title FROM employee LEFT JOIN role ON employee.role_id=role.id',function(err,res){
                          console.table(res);
                          console.log(res)
                          
                          for (let i=0;i<res.length;i++){
                            listEmps.push(`${res[i].first_name} ${res[i].last_name} ${res[i].id}`);
                            listRoles.push(`${res[i].title} ${res[i].role_id}`)
                           };
                           
                         
                                          if(err) {
                                                  throw err
                                                };
                              
                                                inquirer
                                                  .prompt([{
                                                    name: 'empToChoose',
                                                    message: "Please select employee to update the role for",
                                                    type:'list',
                                                    choices:listEmps
                                                  },
                                                  {
                                                    name: 'roleToChoose',
                                                    message: 'Select a new role',
                                                    type:'list',
                                                    choices:listRoles
                                                  }
                                                ])
                                                
                                                .then(function(answer){
                                                  let empIdChosen = answer.empToChoose.split(" ");
                                                  let empChosen = empIdChosen[2];
                                                  
                                                  let roleIdChosen = answer.roleToChoose.split(" ");
                                                  let roleChosen = roleIdChosen[1];
                                                  console.log(empChosen);
                                                  console.log(roleChosen)
                                                 
                                                  let sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
                                                    connection.query(sql,[roleChosen,empChosen],function(err,res){
                                                        console.log(`Updated! ${empIdChosen[0]} ${empIdChosen[1]} is now ${roleIdChosen[0]}`);
                                                        // console.log(res);
                                                        updateEmpRoles();
                                                          
                                                      })
                                                   
                                                  // ---

                                                })  
                                               
                                                //  updateEmpRoles();
                                              });
                                      
                  }

                else if(answer.updRole ==="exit"){
                  startApp();
                }
            });
            

};

