const nodemailer = require('nodemailer');

// 1. Formal Letter Generator (Matches STEP 4 of College Requirements)
function generateCoverLetter(title, company, userLinkedIn) {
    // This is the formal template requested by your college
    return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${title} position, as posted recently on LinkedIn. 

With my technical background and experience in building efficient solutions, I am confident that I can contribute effectively to your current projects.

Submission Details:
• Role: ${title}
• Company: ${company}
• LinkedIn Profile: ${userLinkedIn || 'Provided in Resume'}
• Availability: Immediate

Please find my resume attached for your review. I look forward to the possibility of discussing how my background can benefit your team.

Best regards,
Applicant`;
}

// 2. Main Email Function
async function sendEmails(jobs, resumePath, userEmail, userAppPassword, userLinkedIn) {
    let successCount = 0, failCount = 0;
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: userEmail, 
            pass: userAppPassword 
        }
    });

    for (const job of jobs) {
        // Skip jobs where we couldn't find a recruiter email
        if (!job.email || job.email === 'N/A') continue;
        
        // --- THIS IS WHERE YOU ADD THE LOGIC ---
        // We generate the formal message using the job details and user's LinkedIn
        const formalMessage = generateCoverLetter(job.title, job.company, userLinkedIn);

        try {
            await transporter.sendMail({
                from: userEmail,
                to: job.email,
                subject: `Application for ${job.title} at ${job.company}`,
                text: formalMessage, // Using the formal letter here
                attachments: [
                    { 
                        filename: 'Resume.pdf', 
                        path: resumePath 
                    }
                ]
            });
            console.log(`> Email successfully sent to ${job.email}`);
            successCount++;
        } catch (error) {
            console.error(`> Failed to send email to ${job.email}:`, error.message);
            failCount++;
        }
    }
    
    return { successCount, failCount };
}

module.exports = { sendEmails };