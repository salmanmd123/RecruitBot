const nodemailer = require('nodemailer');

/**
 * 1. Updated Formal Letter Generator 
 */
function generateCoverLetter(title, company, userLinkedIn, jobLink) {
    return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${title} position, as seen on LinkedIn. 

With my technical background and experience in building efficient solutions, I am confident that I can contribute effectively to your current projects.

Submission Details:
• Role: ${title}
• Company: ${company}
• Job Vacancy: ${jobLink || 'Link provided on LinkedIn'}
• LinkedIn Profile: ${userLinkedIn || 'Provided in Resume'}
• Availability: Immediate

Please find my resume attached for your review. I look forward to the possibility of discussing how my background can benefit your team.

Best regards,
Applicant`;
}

/**
 * 2. Main Email Function
 */
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
        if (!job.email || job.email === 'N/A') continue;
        
        const formalMessage = generateCoverLetter(job.title, job.company, userLinkedIn, job.link);

        try {
            await transporter.sendMail({
                from: userEmail,
                to: job.email,
                subject: `Application for ${job.title} at ${job.company}`,
                text: formalMessage,
                attachments: [
                    { 
                        filename: 'Resume.pdf', 
                        path: resumePath 
                    }
                ]
            });
            
            // Clean log for your terminal
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