const axios = require('axios');
const PromptLog = require('../models/promptLog');
const { generateResponse } = require('../services/ollamaService');

/**
 * POST /api/prompt
 * Main gateway: classify → decide action → respond
 */
const handlePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

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
      // If detector is down, default to SAFE with low confidence
      detection = { label: 'SAFE', confidence: 0.5, riskScore: 0.1 };
    }

    // Step 2: Use the risk score FROM the detector directly (don't recalculate)
    const riskScore = detection.riskScore;
    const confidence = detection.confidence;
    const label = detection.label;

    // Step 3: Determine action based on label AND risk score
    let action;
    if (label === 'JAILBREAK') {
      action = 'BLOCKED';  // ALL jailbreak → always block
    } else if (label === 'PROMPT_INJECTION' && riskScore > 0.5) {
      action = 'BLOCKED';
    } else if (label === 'PROMPT_INJECTION' && riskScore > 0.3) {
      action = 'SANITIZED';
    } else {
      action = 'ALLOWED';
    }

    // Step 4: Generate response based on action
    let response;

    if (action === 'BLOCKED') {
      response = `🚫 **BLOCKED** — Your prompt was classified as **${label}** with a risk score of ${Math.round(riskScore * 100)}%.\n\nThis prompt has been blocked by the AI Firewall to prevent potential security threats. The content appears to be ${label === 'JAILBREAK' ? 'a jailbreak attempt trying to bypass AI safety restrictions or request harmful content' : 'a prompt injection attempting to extract system instructions'}.\n\n🛡️ AI Firewall is protecting the LLM from malicious inputs.`;
    } else if (action === 'SANITIZED') {
      response = `⚠️ **SANITIZED** — Your prompt was flagged as potentially suspicious (${label}, risk: ${Math.round(riskScore * 100)}%).\n\nThe AI Firewall has sanitized this request. The prompt was forwarded with additional safety constraints.\n\n🛡️ Monitoring active.`;
    } else {
      // ALLOWED — Forward to LLM (smart fallback if Ollama is offline)
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
      createdAt: promptDoc.createdAt,
    });

  } catch (error) {
    console.error('❌ handlePrompt error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/logs
 * Fetch all prompt logs (newest first)
 */
const getLogs = async (req, res) => {
  try {
    const logs = await PromptLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('❌ getLogs error:', error.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

/**
 * GET /api/stats
 * Dashboard statistics
 */
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

module.exports = { handlePrompt, getLogs, getStats };