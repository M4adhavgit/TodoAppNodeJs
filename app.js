/*
 *  Created a Table with name todo in the todoApplication.db file using the CLI.
 */

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const checkPriority = (priority) => {
  const listOfPriority = ["HIGH", "MEDIUM", "LOW"];
  return listOfPriority.includes(priority);
};

const checkStatus = (status) => {
  const listOfStatus = ["TO DO", "IN PROGRESS", "DONE"];
  return listOfStatus.includes(status);
};

const checkCategory = (category) => {
  const listOfCategory = ["WORK", "HOME", "LEARNING"];
  return listOfCategory.includes(category);
};

const checkDate = (dueDate) => {
  const newOne = format(new Date(duedate), "yyyy-MM-dd");
  return dueDate === newOne;
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const convertToreq = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category, date } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (checkStatus(status) === true && checkPriority(priority) === true) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status and Priority");
      }

      break;

    case hasCategoryAndStatusProperties(request.query):
      if (checkStatus(status) === true && checkCategory(category) === true) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status and Category");
      }

      break;

    case hasCategoryAndPriorityProperties(request.query):
      if (
        checkPriority(priority) === true &&
        checkCategory(category) === true
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}'
        AND category = '${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority and Category");
      }

      break;

    case hasPriorityProperty(request.query):
      if (checkPriority(priority) === true) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasStatusProperty(request.query):
      if (checkStatus(status) === true) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case hasCategoryProperty(request.query):
      if (checkCategory(category) === True) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);

  response.send(data.map((each) => convertToreq(each)));
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);

  response.send(convertToreq(todo));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (checkDate(date) === True) {
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      due_date= ${date};`;
    const todo = await database.get(getTodoQuery);
    response.send(todo.map((each) => convertToreq(each)));
  } else {
    response.status(400);
    response.send("Invalid Todo Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (checkStatus(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (checkPriority(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (checkCategory(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (checkDate(dueDate) === false) {
    response.status(400);
    response.send("Invalid Todo Due Date");
  } else {
    const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}','${dueDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;

    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;

    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${duedate}'

    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
