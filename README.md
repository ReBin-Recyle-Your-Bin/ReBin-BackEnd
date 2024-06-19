# ️🪴🗑 REBIN CLOUD COMPUTING PROJECT

## About the project

## Cloud Computing Team Members:

1. C299D4KX0723 - Mutia Istiqomah - Universitas Pendidikan Indonesia
2. C299D4KX0532 - Ghalda Azzahra Dwitami - Universitas Pendidikan Indonesia

## ReBin Project Background
The issue of waste in Indonesia has become increasingly complex, with communities generating 17.6 million tons of waste annually, of which only 67.4% is effectively managed. This leaves 32.6% of waste unmanaged due to low awareness of waste management practices, resulting in environmental pollution, health issues, and economic losses. A significant challenge is the identification and proper management of various waste types, worsened by inadequate education on disposal and recycling. Our goal is to address these challenges with an innovative solution: an application that accurately identifies waste types, educates on recycling processes, and promotes sustainable waste management practices nationwide.

## Cloud Computing Part in the Project
Build RESTful APIs using Node.js and the Express framework for the backend, prepare MongoDB as the database, and deploy the backend and machine learning model on Google Cloud Platform.
 

## Endpoints
### Login-Register
- **POST /register** : Endpoint for registering a new user by providing the necessary information.
- **POST /login** : Endpoint for authenticating a user by providing credentials (username and password).
### Users
- **GET /user/profile?_id=<userid>** : Retrieve the user's profile based on the user ID (_id).
- **PUT /user/profile** : Update the specified user's profile information.
### Craft 
- **GET /craft/all** : Retrieve a list of all available crafts.
- **GET /craft/:id** : Retrieve the details of a craft based on a specific craft ID.
- **GET /crafts?page=<pagenumber>** : Retrieve a list of crafts with default paging.
- **GET /crafting?page=<pagenumber>&limit=<contentnumber>** : Retrieve a list of crafts with paging and a limit on the number of items.
- **GET /craft?className=<className>** : Retrieve a list of crafts filtered by a specific class (className).
### Story
- **GET /story/all** : Retrieve a list of all available stories.
- **GET /story/:id** : Retrieve the details of a story based on a specific story ID.
- **GET /stories?page=<pagenumber>** : Retrieve a list of stories with default paging.
- **GET /story?page=<pagenumber>&limit=<contentnumber>** : Retrieve a list of stories with paging and a limit on the number of items.
### Points
- **POST /points** : Add points for a specific user.
- **GET /points?userId=<userId>** : Retrieve the number of points a specific user has.
### History
- **POST /detect-waste/history** : Record a specific user's activity history.
- **GET /detect-waste/history?userId=<userId>** : Retrieve the activity history of a specific user.
- **DELETE /detect-waste/history/:id** : Delete an activity history entry based on a specific ID.
- **DELETE /detect-waste/history?userId=<userId>** : Delete all activity history for a specific user.
### Others
- **GET /challenge** : Retrieve a list of available challenges.
- **GET /tukar-point** : Retrieve a list of items that can be redeemed with points.
- **POST /upload** : Upload a new image.
- **GET /image?userId=<userId>** : Retrieve a list of images uploaded by a specific user based on the user ID.
- **POST /ID/predict** : Submit a request to make a prediction using a machine learning model.

**Note:** All the above endpoints require authentication, except for `POST /register` , `POST /login` and `POST /ID/predict`. To use endpoints that require authentication, you need to send the authentication token in the request header with the format `Authorization: Bearer <token>`.

## Deployed Link
| Service | Deployed Link |
| :-------- | :------- | 
| BackEnd API | https://rebin-app.et.r.appspot.com |
| ML Model & API | https://rebin-ml-kbd6pi6apq-et.a.run.app |

## Docummentation Postman
[Documentation Link](https://documenter.getpostman.com/view/36410448/2sA3XTdf9J#7eeb3c7c-e4c3-4803-b424-5827d055769f)

## Screenshot Docummentation
[Screenshot Docummentation](https://drive.google.com/drive/folders/160oviCLd6Ap6pxz8k_ff79TVIIXd7PL6?usp=sharing)
