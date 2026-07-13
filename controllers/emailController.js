const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Template = require("../models/Template");
const nodemailer = require('nodemailer');
const User = require('../models/User');

function runPython(websites) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, "../python/app.py");
    console.log("Running Python script:", pythonScriptPath);

    const python = spawn("python", [pythonScriptPath]);
    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.log(data.toString());
    });

    python.on("error", reject);

    python.stdin.write(JSON.stringify({
      websites: websites
    }));

    python.stdin.end();

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(errorOutput));
      }
      try {
        resolve(JSON.parse(output));
      } catch (err) {
        reject(new Error("Python returned invalid JSON.\n" + output));
      }
    });
  });
}

// Email validation function
const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Enhanced email validation and cleaning function
const cleanAndValidateEmail = (email) => {
  if (!email) return null;

  let cleanEmail = email.trim().replace(/^["']|["']$/g, '').trim();

  if (!cleanEmail) return null;

  const fileExtensions = /\.(webp|png|jpg|jpeg|gif|svg|bmp|ico|tiff|pdf|doc|docx|zip|rar|exe|dmg|apk)$/i;
  if (fileExtensions.test(cleanEmail)) {
    return { valid: false, reason: 'File extension detected', email: cleanEmail };
  }

  const systemIdPattern = /^[a-f0-9]{32,64}@/i;
  if (systemIdPattern.test(cleanEmail)) {
    return { valid: false, reason: 'System ID detected', email: cleanEmail };
  }

  const isValid = validateEmail(cleanEmail);

  return {
    valid: isValid,
    email: cleanEmail,
    reason: isValid ? 'Valid' : 'Invalid email format'
  };
};

// Validate and clean all emails from recipients
const processRecipients = (recipients) => {
  if (!Array.isArray(recipients)) {
    if (typeof recipients === 'string') {
      const emails = recipients
        .split(/[\n,;]+/)
        .map(e => e.trim())
        .filter(Boolean);
      recipients = emails;
    } else {
      return {
        valid: false,
        error: 'Recipients must be an array or string',
        validEmails: [],
        invalidEmails: []
      };
    }
  }

  const validEmails = [];
  const invalidEmails = [];

  recipients.forEach(email => {
    const result = cleanAndValidateEmail(email);
    if (result && result.valid) {
      validEmails.push(result.email);
    } else if (result) {
      invalidEmails.push({
        email: result.email,
        reason: result.reason
      });
    }
  });

  const filteredValidEmails = validEmails.filter(email => {
    const placeholders = ['email@email.com', 'name@emailaddress.com', 'yourname@company.com'];
    return !placeholders.includes(email.toLowerCase());
  });

  return {
    valid: invalidEmails.length === 0,
    validEmails: filteredValidEmails,
    invalidEmails: invalidEmails,
    totalValid: filteredValidEmails.length,
    totalInvalid: invalidEmails.length
  };
};

// Create email transporter
const createTransporter = (userEmail, appPassword) => {
  let service = 'gmail';
  let host = 'smtp.gmail.com';
  let port = 587;
  let secure = false;

  if (userEmail.includes('@outlook.com') || userEmail.includes('@hotmail.com')) {
    service = 'hotmail';
    host = 'smtp.office365.com';
    port = 587;
    secure = false;
  } else if (userEmail.includes('@yahoo.com')) {
    service = 'yahoo';
    host = 'smtp.mail.yahoo.com';
    port = 587;
    secure = false;
  }

  return nodemailer.createTransport({
    service: service,
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: userEmail,
      pass: appPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send single email
const sendSingleEmail = async (transporter, fromEmail, toEmail, ccEmail, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };
    
    if (ccEmail && validateEmail(ccEmail)) {
      mailOptions.cc = ccEmail;
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      recipient: toEmail,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error.message);
    return {
      success: false,
      recipient: toEmail,
      error: error.message
    };
  }
};

// Generate random delay between 5-20 seconds
const getRandomDelay = () => {
  const minDelay = 5000; // 5 seconds
  const maxDelay = 20000; // 20 seconds
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
};

// Distribute templates evenly among recipients
const distributeTemplates = (templates, recipients) => {
  if (!templates || templates.length === 0 || !recipients || recipients.length === 0) {
    return [];
  }

  const distribution = [];
  const templateCount = templates.length;
  
  recipients.forEach((recipient, index) => {
    // Round-robin distribution: recipient 0 gets template 0, recipient 1 gets template 1, etc.
    const templateIndex = index % templateCount;
    distribution.push({
      recipient: recipient,
      template: templates[templateIndex],
      templateIndex: templateIndex
    });
  });

  return distribution;
};

// Alternative: Even distribution (assign templates equally)
const distributeTemplatesEvenly = (templates, recipients) => {
  if (!templates || templates.length === 0 || !recipients || recipients.length === 0) {
    return [];
  }

  const distribution = [];
  const templateCount = templates.length;
  const recipientsPerTemplate = Math.ceil(recipients.length / templateCount);
  
  let recipientIndex = 0;
  
  templates.forEach((template, templateIdx) => {
    const start = templateIdx * recipientsPerTemplate;
    const end = Math.min(start + recipientsPerTemplate, recipients.length);
    
    for (let i = start; i < end; i++) {
      distribution.push({
        recipient: recipients[i],
        template: template,
        templateIndex: templateIdx
      });
    }
  });

  return distribution;
};

module.exports = {
  getEmails: async (req, res, next) => {
    try {
      const websites = req.body.domains;

      if (!Array.isArray(websites) || websites.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide websites array.",
        });
      }

      const BATCH_SIZE = 50;
      const batches = [];

      for (let i = 0; i < websites.length; i += BATCH_SIZE) {
        batches.push(websites.slice(i, i + BATCH_SIZE));
      }

      let finalResults = [];

      try {
        for (const batch of batches) {
          console.log(`Processing Batch (${batch.length} websites)...`);
          const batchResult = await runPython(batch);
          if (batchResult.results) {
            finalResults.push(...batchResult.results);
          }
        }

      let user = await User.findOne({_id: req.user.id});

      user.domains = user.domains + websites.length;
      user.emails = user.emails + finalResults.map((item)=>{if(item.totalEmails > 0){count ++}});

      await user.save();

        res.json({
          success: true,
          total: finalResults.length,
          results: finalResults,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  sendEmail: async (req, res, next) => {
    try {
      console.log('Request Body:', req.body);

      let {
        fromEmail,
        ccEmail,
        templates: templateIds,
        recipients
      } = req.body.payload;

      // ============ VALIDATION ============

      // 1. Validate From Email
      if (!fromEmail) {
        return res.status(400).json({
          success: false,
          message: 'From email is required'
        });
      }

      const fromEmailResult = cleanAndValidateEmail(fromEmail);
      if (!fromEmailResult || !fromEmailResult.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid from email format',
          details: fromEmailResult
        });
      }
      fromEmail = fromEmailResult.email;

      // 2. Validate CC Email (if provided)
      if (ccEmail) {
        const ccEmailResult = cleanAndValidateEmail(ccEmail);
        if (!ccEmailResult || !ccEmailResult.valid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid CC email format',
            details: ccEmailResult
          });
        }
        ccEmail = ccEmailResult.email;
      }

      // 3. Process and validate recipients
      const recipientResults = processRecipients(recipients);

      if (recipientResults.validEmails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid recipients found. All emails were invalid.',
          invalidEmails: recipientResults.invalidEmails
        });
      }

      if (recipientResults.invalidEmails.length > 0) {
        console.log('Invalid emails found:', recipientResults.invalidEmails);
      }

      // 4. Validate Templates
      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one template ID is required'
        });
      }

      // ============ FETCH TEMPLATES ============

      let templates = [];
      try {
        templates = await Template.find({
          _id: { $in: templateIds }
        });

        if (templates.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No templates found with the provided IDs'
          });
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching templates from database',
          error: error.message
        });
      }

      // ============ GET USER APP PASSWORD ============

      let user = await User.findOne({_id: req.user.id});

      // ============ CREATE TRANSPORTER ============

      let transporter;
      try {
        transporter = createTransporter(fromEmail, user.appPassword);
        await transporter.verify();
        console.log('SMTP connection verified successfully');
      } catch (error) {
        console.error('SMTP connection error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to connect to email server',
          error: error.message
        });
      }

      // ============ DISTRIBUTE TEMPLATES AMONG RECIPIENTS ============
      
      const validRecipients = recipientResults.validEmails;
      
      // Use round-robin distribution
      const emailDistribution = distributeTemplates(templates, validRecipients);
      
      // OR use even distribution (uncomment if preferred)
      // const emailDistribution = distributeTemplatesEvenly(templates, validRecipients);

      console.log(`📧 Template Distribution: ${emailDistribution.length} emails to send`);
      console.log(`📋 ${templates.length} templates available`);
      console.log(`👥 ${validRecipients.length} recipients`);

      // ============ SEND EMAILS WITH DYNAMIC DELAYS ============

      const results = [];
      let successful = 0;
      let failed = 0;

      try {
        for (let i = 0; i < emailDistribution.length; i++) {
          const { recipient, template, templateIndex } = emailDistribution[i];
          
          // Prepare email content for this specific template
          const subject = template.title || 'Email from ' + fromEmail;
          let htmlContent = `<div style="margin-bottom: 20px; padding-bottom: 20px;">`;
          htmlContent += `<h2 style="color: #2563eb; margin-bottom: 10px;">${template.title}</h2>`;
          htmlContent += `<div>${template.content || template.body || ''}</div>`;
          htmlContent += `</div>`;

          console.log(`📧 [${i + 1}/${emailDistribution.length}] Sending to ${recipient} using template "${template.title}"...`);

          const result = await sendSingleEmail(
            transporter,
            fromEmail,
            recipient,
            ccEmail,
            subject,
            htmlContent
          );

          results.push({
            ...result,
            templateUsed: template.title,
            templateId: template._id
          });

          if (result.success) {
            successful++;
            console.log(`✅ Email sent to ${recipient} successfully`);
          } else {
            failed++;
            console.log(`❌ Failed to send to ${recipient}: ${result.error}`);
          }

          // Add dynamic delay between emails (5-20 seconds)
          // Don't add delay after the last email
          if (i < emailDistribution.length - 1) {
            const delay = getRandomDelay();
            console.log(`⏳ Waiting ${delay/1000} seconds before next email...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } catch (error) {
        console.error('Error during email sending process:', error);
        return res.status(500).json({
          success: false,
          message: 'Error during email sending process',
          error: error.message,
          results: results
        });
      }

      // ============ EMAIL COUNT UPDATE ============

      user.sends = user.sends + recipientResults.totalValid;

      await user.save();

      // ============ RESPONSE ============

      const response = {
        success: true,
        message: `Email sending completed: ${successful} successful, ${failed} failed`,
        stats: {
          totalReceived: recipients ? recipients.length : 0,
          validEmails: recipientResults.totalValid,
          invalidEmails: recipientResults.totalInvalid,
          successful: successful,
          failed: failed,
          templatesUsed: templates.length,
          distributionMethod: 'Round-robin'
        },
        details: {
          fromEmail,
          ccEmail: ccEmail || null,
          templatesUsed: templates.map(t => ({
            id: t._id,
            title: t.title
          })),
          distribution: emailDistribution.map(item => ({
            recipient: item.recipient,
            templateTitle: item.template.title,
            templateId: item.template._id
          })),
          invalidRecipients: recipientResults.invalidEmails.length > 0 ? recipientResults.invalidEmails : undefined
        },
        results: results
      };

      console.log('📊 Email sending results:', {
        total: emailDistribution.length,
        successful,
        failed,
        invalidEmails: recipientResults.invalidEmails.length
      });

      return res.status(200).json(response);

    } catch (error) {
      console.error('Unexpected error in sendEmail:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
        error: error.message
      });
    }
  }
};