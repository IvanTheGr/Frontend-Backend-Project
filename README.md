## Setup Project

This project contains Frontend project which shopify and Backend project which todo-api.

# For Frontend Project
## Table of Contents
- [Installation](#installation)
- [Deployment](#deployment)

## Installation
Clone this repository : 
  ```
    https://github.com/IvanTheGr/Frontend-Backend-Project.git
  ```

Then install dependencies :
```
    npm install
```

To run the project, You can do :
```
    npm run build
```

Then the app will be appear at localhost. \

## Deployment
This project can be deployed on your own website, Netlify, Vercel, or any static hosting. \

Steps:
First,
```
Run npm run build
```
And Ensure asset paths are correct
```
base: './' 
```
in vite.config.ts

# For Backend Project
   
## Table of Content
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Testing](#testing)

## Prerequisites
Make sure the version of you have install : \
- Node.js (v18)
- npm

## Installation 
Clone this repository : 
  ```
    https://github.com/IvanTheGr/Frontend-Backend-Project.git
  ```

Then install dependencies :
```
    npm install
```

## Testing
This can be done in postman
1. Register User 
- Choose method "POST"
- Input url "http://localhost:3000/api/auth/register"
- Choose body then raw, insert this :
  ```
  {
  "username": "john",
  "email": "john@test.com",
  "password": "123456"
  }
  ```
- Then click Send

2. Login User 
- Click "+" for new request
- Choose method "POST"
- Input url "http://localhost:3000/api/auth/login"
- Choose body then raw, insert this :
```
{
  "email": "john@test.com",
  "password": "123456"
}
```
- Then click Send

3. Create Todo
- Click "+" for new request
- Choose method "POST"
- Input url "http://localhost:3000/api/todos"
- Then click Authentication
- Choose type : Bearer Token
- Input the Token that is provided before when doing Login User
- Then add this to body :
  ```
  {
  "title": "Belajar Node.js",
  "description": "Belajar REST API",
  "priority": "high"
  }
  ```
- Then click Send

4. Get All Todo
- Click "+" for new request
- Choose method "GET"
- Input url "http://localhost:3000/api/todos"
- Then click Authentication
- Choose type : Bearer Token
- Input the Token that is provided before when doing Login User
- No need input inside body, then click Send

5. Update Todo
- Click "+" for new request
- Choose method "PUT"
- Input url "http://localhost:3000/api/todos/1"
- Then click Authentication
- Choose type : Bearer Token
- Input the Token that is provided before when doing Login User
- Then add this to body :
  ```
  {
  "title": "Todo Updated",
  "completed": true
  }
  ```

6. Delete Todo
- Click "+" for new request
- Choose method "DELETE"
- Input url "http://localhost:3000/api/todos/1"
- Then click Authentication
- Choose type : Bearer Token
- Input the Token that is provided before when doing Login User
- No input is needed inside body
