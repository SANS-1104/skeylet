# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [https://skeylet.com](https://skeylet.com) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


## Frontend Folder Structure

frontend/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
│
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo.png
│   ├── manifest.json
│   ├── robots.txt
│   ├── images/
│   └── video/
│
└── src/
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── globals.css
    ├── logo.svg
    ├── reportWebVitals.js
    ├── setupTests.js
    │
    ├── AUTH/
    │   ├── auth.css
    │   ├── AuthPage.jsx
    │   ├── DashboardAuthProtect.jsx
    │   ├── Login.jsx
    │   ├── LoginSuccess.jsx
    │   ├── PrivateRoute.jsx
    │   ├── Signup.jsx
    │   ├── SuperAdminAuthContext.jsx
    │   └── SuperAdminPrivateRoute.jsx
    │
    ├── Navbar/
    │   └── AuthContext.jsx
    │
    ├── STUDIO/
    │   ├── LANDING-PAGE/
    │   │   ├── BenefitsSection.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── FeaturesSection.jsx
    │   │   ├── FinalCTASection.jsx
    │   │   ├── Footer.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── PaymentFailed.jsx
    │   │   ├── PaymentStatusPage.jsx
    │   │   ├── PaymentSuccess.jsx
    │   │   ├── PricingSection.jsx
    │   │   ├── ProductPreviewSection.jsx
    │   │   ├── TestimonialsSection.jsx
    │   │   ├── UseCasesSection.jsx
    │   │   ├── figma/
    │   │   │   └── ImageWithFallback.jsx
    │   │   └── ui/
    │   │       ├── accordion.jsx
    │   │       ├── alert.jsx
    │   │       ├── alert-dialog.jsx
    │   │       ├── aspect-ratio.jsx
    │   │       ├── avatar.jsx
    │   │       ├── badge.jsx
    │   │       ├── breadcrumb.jsx
    │   │       ├── button.jsx
    │   │       ├── calendar.jsx
    │   │       ├── card.jsx
    │   │       ├── carousel.jsx
    │   │       ├── chart.jsx
    │   │       ├── checkbox.jsx
    │   │       ├── collapsible.jsx
    │   │       ├── command.jsx
    │   │       ├── context-menu.jsx
    │   │       ├── dialog.jsx
    │   │       ├── drawer.jsx
    │   │       ├── dropdown-menu.jsx
    │   │       ├── form.jsx
    │   │       ├── hover-card.jsx
    │   │       ├── input.jsx
    │   │       ├── input-otp.jsx
    │   │       ├── label.jsx
    │   │       ├── menubar.jsx
    │   │       ├── navigation-menu.jsx
    │   │       ├── pagination.jsx
    │   │       ├── popover.jsx
    │   │       ├── progress.jsx
    │   │       ├── radio-group.jsx
    │   │       ├── resizable.jsx
    │   │       ├── scroll-area.jsx
    │   │       ├── select.jsx
    │   │       ├── separator.jsx
    │   │       ├── sheet.jsx
    │   │       ├── sidebar.jsx
    │   │       ├── skeleton.jsx
    │   │       ├── slider.jsx
    │   │       ├── sonner.jsx
    │   │       ├── switch.jsx
    │   │       ├── table.jsx
    │   │       ├── tabs.jsx
    │   │       ├── textarea.jsx
    │   │       ├── toggle.jsx
    │   │       ├── toggle-group.jsx
    │   │       ├── tooltip.jsx
    │   │       ├── use-mobile.js
    │   │       └── utils.js
    │   │
    │   ├── LP2/
    │   │   ├── BenefitsSection.jsx
    │   │   ├── FeaturesSection.jsx
    │   │   ├── FinalCTASection.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Header.jsx
    │   │   ├── Header2.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── HowItWorksSection.jsx
    │   │   ├── LP2HomePage.jsx
    │   │   ├── LoggedInCTASection.jsx
    │   │   ├── LoggedInHeader.jsx
    │   │   ├── LoggedInHeroSection.jsx
    │   │   ├── PlatformToggle.jsx
    │   │   ├── PricingSection.jsx
    │   │   ├── PrivacyPolicy.jsx
    │   │   ├── ProductPreviewSection.jsx
    │   │   ├── RefundPolicy.jsx
    │   │   ├── StatsSection.jsx
    │   │   ├── TermsOfService.jsx
    │   │   ├── TestimonialsSection.jsx
    │   │   └── UseCasesSection.jsx
    │   │
    │   ├── StudioSuperAdmin/
    │   │   ├── superadmin.css
    │   │   ├── StudioSuperAdminDashboard.jsx
    │   │   ├── StudioSuperAdminDashboardSidebar.jsx
    │   │   ├── StudioSuperAdminLoginPage.jsx
    │   │   ├── StudioSuperAdminSampleContent.jsx
    │   │   ├── PlanManagement/
    │   │   │   └── PlanManagement.jsx
    │   │   └── UserManagement/
    │   │       └── UserManagement.jsx
    │   │
    │   └── USER/
    │       ├── AnalyticsCharts.jsx
    │       ├── AnalyticsPage.jsx
    │       ├── CalendarPage.jsx
    │       ├── CreateBlogPage.jsx
    │       ├── Dashboard.jsx
    │       ├── DashboardHeader.jsx
    │       ├── DashboardOverview.jsx
    │       ├── DraftsSidebar.jsx
    │       ├── PostsPage.jsx
    │       └── ProfilePage.jsx
    │
    ├── api/
    │   └── axiosClient.js
    │
    ├── data/
    │   └── subreddits.json
    │
    └── utils/
        ├── auth.js
        ├── formatCurrency.js
        └── formatDate.js
