HireFusion - Job Automator

A professional Application designed to automate the job search and application process. This tool uses **Puppeteer** to scrape real-time job postings from LinkedIn and **Nodemailer** to send personalized, formal job applications via Gmail.

## 🌟 Key Features

* **LinkedIn Automation**: Scrapes job postings based on keywords and location.
* **Smart Filtering**: Specifically built to filter for **Contract (C-C)** roles and jobs posted within the **last 24 hours**.
* **Gmail Integration**: Automatically composes and sends formal cover letters with your resume attached.
* **Secure Authentication**: User data is protected using **Bcrypt** password hashing and session-based security.
* **Live Automation Console**: A real-time dashboard terminal that shows the bot's progress (Scraping -> Extracting -> Mailing).
* **Application History**: Keeps a local record of every successful application sent.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Bootstrap 5), JavaScript (Vanilla)
* **Backend**: Node.js, Express.js
* **Automation**: Puppeteer (Chromium)
* **Email**: Nodemailer (SMTP)
* **Security**: Bcrypt.js, Express-Session
* **Storage**: Local JSON Database

## ⚙️ Prerequisites

* **Node.js**: Version 14.x or higher
* **Gmail Account**: You must generate a [Google App Password](https://myaccount.google.com/apppasswords).
    * *Note: Do not use your regular Gmail password.*

## 🚀 Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url>
    cd spa-job-portal
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Prepare Folders**:
    Ensure the following directory structure exists:
    ```text
    /data
    /public/uploads
    ```

4.  **Run the Server**:
    ```bash
    node server.js
    ```
    The app will be live at `http://localhost:3000`.

## 📖 Usage Guide

1.  **Register**: Create an account. Use your Gmail address and your 16-digit **Google App Password**.
2.  **Dashboard**: Enter a job title (e.g., "Java Developer") and location.
3.  **Upload**: Select your resume (PDF format).
4.  **Automate**: Click "Start Auto-Apply" and watch the **Live Console** as the robot finds jobs and sends emails.

## 🔒 Security & Privacy

* **App Passwords**: This app uses Google's App Password protocol, ensuring your primary account credentials are never exposed to the code.
* **Bcrypt**: All user passwords are encrypted before storage.
* **Local Storage**: All history and user data are stored locally in the `/data` folder.

## 📝 License

Distributed under the MIT License.
