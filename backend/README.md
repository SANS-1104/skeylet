## Backend Folder Structure

backend/
├── .env
├── README.md
├── index.js
├── package.json
├── config/
│   ├── db.js
│   ├── generateImage.js
│   └── googleClient.js
├── controllers/
│   ├── adminStudioPlanController.js
│   ├── adminStudioUserController.js
│   ├── analyticsController.js
│   ├── authController.js
│   ├── blogController.js
│   ├── draftController.js
│   ├── imageController.js
│   ├── postController.js (has unified controller functions)
│   ├── linkedinController.js
|   ├── facebookController.js
│   └── scheduleController.js
├── data/
│   └── linkedinKeywordScores.json
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   └── quotaMiddleware.js
├── models/
│   ├── Notification.js
│   ├── Plan.js
│   ├── Payment.js
│   ├── Post.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── payment.js
│   ├── plan.js
│   ├── post.js
│   ├── razorPay.js
│   ├── redditRoutes.js
│   ├── facebookRoutes.js 
│   ├── unifiedPost.js
│   └── studioAdmin.js
├── scheduler/
│   ├── agenda.js
│   ├── facebookAgenda.js 
|   └── redditAgenda.js
└── utils/
    ├── fetchLinkedInAnalytics.js
    ├── postToReddit.js
    ├── postToFacebook.js
    └── postToLinkedIn.js

## What Each Folder Does?

---------------------------------------------------------------------------------
| Folder/File      | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `config/db.js`   | Connects to MongoDB using credentials from `.env`          |
| `controllers/`   | Contains logic for auth and blog routes                    |
| `middleware/`    | Contains `authMiddleware.js` to protect routes             |
| `models/User.js` | Defines user schema including LinkedIn fields              |
| `routes/auth.js` | Route handlers for login, signup, user preferences         |
| `routes/blog.js` | Route handlers for blog generation & LinkedIn post         |
| `.env`           | Stores secret keys, DB URI, API keys                       |
| `index.js`       | Sets up Express app, middleware, routes, and DB connection |
---------------------------------------------------------------------------------


