const axios = require('axios');
const PromptLog = require('../models/promptLog');
const { generateResponse } = require('../services/ollamaService');
const { recordViolation, getBlockedIPs, getIPStats } = require('../middleware/rateLimiter');

const handlePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    const clientIP = req.clientIP || req.ip;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Step 1: Send to Python AI detector
    let detection;
    try {
      const detectionRes = await axios.post(
        `${process.env.DETECTION_SERVICE_URL}/detect`,
        { prompt },
        { timeout: 30000 }
      );
      detection = detectionRes.data;
    } catch (err) {
      console.error('❌ Detection service error:', err.message);
      detection = { label: 'SAFE', confidence: 0.5, riskScore: 0.1 };
    }

    const riskScore = detection.riskScore;
    const confidence = detection.confidence;
    const label = detection.label;

    // Step 2: Determine action
    let action;
    if (label === 'JAILBREAK') {
      action = 'BLOCKED';
    } else if (label === 'PROMPT_INJECTION') {
      if (riskScore > 0.5) action = 'BLOCKED';
      else action = 'SANITIZED';
    } else {
      action = 'ALLOWED';
    }

    // Step 3: Record violation if blocked
    let rateLimitInfo = null;
    if (action === 'BLOCKED') {
      rateLimitInfo = recordViolation(clientIP);
    }

    // Step 4: Generate response based on action
    let response;

    if (action === 'BLOCKED') {
      const warningMsg = rateLimitInfo && !rateLimitInfo.blocked
        ? `\n\n⚠️ **Warning:** ${rateLimitInfo.remaining} more violation(s) before your IP gets temporarily blocked.`
        : rateLimitInfo && rateLimitInfo.blocked
        ? `\n\n🔒 **Your IP has been blocked for 15 minutes** due to repeated malicious activity.`
        : '';

      response = `🚫 This prompt has been BLOCKED by the AI Firewall.\n\n**Threat Type:** ${label}\n**Risk Score:** ${Math.round(riskScore * 100)}%\n**Confidence:** ${Math.round(confidence * 100)}%\n\nThis request was identified as potentially harmful and was NOT forwarded to the LLM.${warningMsg}`;
    } else if (action === 'SANITIZED') {
      response = await generateResponse(prompt);
      response = `⚠️ *[This prompt was sanitized before processing]*\n\n${response}`;
    } else {
      response = await generateResponse(prompt);
    }

    // Step 5: Save to database
    const promptDoc = await PromptLog.create({
      prompt,
      label,
      confidence,
      riskScore,
      action,
      response,
    });

    console.log(`🛡️ [${action}] "${prompt.substring(0, 50)}..." → ${label} (risk: ${Math.round(riskScore * 100)}%, conf: ${Math.round(confidence * 100)}%)`);

    // Step 6: Send response
    res.json({
      prompt,
      label,
      confidence,
      riskScore,
      action,
      response,
      rateLimitInfo,
      createdAt: promptDoc.createdAt,
    });

  } catch (error) {
    console.error('❌ handlePrompt error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await PromptLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('❌ getLogs error:', error.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

const getStats = async (req, res) => {
  try {
    const totalPrompts = await PromptLog.countDocuments();
    const blockedAttacks = await PromptLog.countDocuments({ action: 'BLOCKED' });
    const sanitizedPrompts = await PromptLog.countDocuments({ action: 'SANITIZED' });
    const allowedPrompts = await PromptLog.countDocuments({ action: 'ALLOWED' });
    const jailbreakAttempts = await PromptLog.countDocuments({ label: 'JAILBREAK' });
    const injectionAttempts = await PromptLog.countDocuments({ label: 'PROMPT_INJECTION' });

    res.json({
      totalPrompts,
      blockedAttacks,
      sanitizedPrompts,
      allowedPrompts,
      jailbreakAttempts,
      injectionAttempts,
    });
  } catch (error) {
    console.error('❌ getStats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// NEW: Get blocked IPs for dashboard
const getRateLimitStatus = (req, res) => {
  try {
    const blockedIPs = getBlockedIPs();
    const ipStats = getIPStats();
    res.json({ blockedIPs, ipStats });
  } catch (error) {
    console.error('❌ getRateLimitStatus error:', error.message);
    res.status(500).json({ error: 'Failed to fetch rate limit status' });
  }
};

module.exports = { handlePrompt, getLogs, getStats, getRateLimitStatus };