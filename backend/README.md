backend/
├── .env
├── .gitignore
├── Procfile
├── README.md
├── amplify.yml
├── index.js
├── package.json
├── package-lock.json
│
├── config/
│   ├── db.js
│   ├── generateImage.js
│   └── googleClient.js
│
├── controllers/
│   ├── adminStudioPlanController.js
│   ├── adminStudioUserController.js
│   ├── analyticsController.js
│   ├── authController.js
│   ├── blogController.js
│   ├── draftController.js
│   ├── facebookAuthController.js
│   ├── imageController.js
│   ├── linkedinController.js
│   ├── paymentController.js
│   ├── planController.js
│   ├── postController.js
│   ├── redditAuthController.js
│   ├── redditController.js
│   ├── scheduleController.js
│   └── viralityController.js
│
├── data/
│   └── linkedinKeywordScores.json
│
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   ├── quotaMiddleware.js
│   └── superAdminAuth.js
│
├── models/
│   ├── Analytics.js
│   ├── Notification.js
│   ├── Payment.js
│   ├── Plan.js
│   ├── Post.js
│   └── User.js
│
├── routes/
│   ├── adminAuth.js
│   ├── auth.js
│   ├── facebookRoutes.js
│   ├── googleAuth.js
│   ├── payment.js
│   ├── plan.js
│   ├── post.js
│   ├── razorPay.js
│   ├── redditRoutes.js
│   ├── studioAdmin.js
│   ├── unifiedPost.js
│   └── variantPay.js
│
├── scheduler/
│   ├── agenda.js
│   ├── facebookAgenda.js
│   └── redditAgenda.js
│
└── utils/
    ├── fetchLinkedInAnalytics.js
    ├── googleTrends.js
    ├── linkedinTrends.js
    ├── postToFacebook.js
    ├── postToLinkedIn.js
    ├── postToReddit.js
    └── promptOptimizer.js
