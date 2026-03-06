// In-memory store for tracking IP violations
const ipStore = new Map();

const MAX_VIOLATIONS = 5;        // Max blocked prompts allowed
const WATCH_WINDOW = 10 * 60 * 1000;  // 10 minutes window to count violations
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes block duration

// Get or create IP record
const getIPRecord = (ip) => {
  if (!ipStore.has(ip)) {
    ipStore.set(ip, {
      violations: [],
      blockedUntil: null,
      totalBlocks: 0,
    });
  }
  return ipStore.get(ip);
};

// Check if IP is currently blocked (middleware)
const checkRateLimit = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const record = getIPRecord(ip);
  const now = Date.now();

  // Check if currently blocked
  if (record.blockedUntil) {
    if (now < record.blockedUntil) {
      const remainingMs = record.blockedUntil - now;
      const remainingMins = Math.ceil(remainingMs / 60000);
      const remainingSecs = Math.ceil(remainingMs / 1000);

      console.log(`🚫 RATE LIMITED: IP ${ip} blocked for ${remainingMins} more minutes`);

      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: `Your access has been temporarily suspended due to repeated malicious activity.`,
        blockedUntil: record.blockedUntil,
        remainingSeconds: remainingSecs,
        remainingMinutes: remainingMins,
        totalViolations: record.violations.length,
        totalBlocks: record.totalBlocks,
      });
    } else {
      // Block expired — reset
      record.blockedUntil = null;
      record.violations = [];
      console.log(`✅ UNBLOCKED: IP ${ip} block expired, fresh start`);
    }
  }

  // Attach IP to request for use in controller
  req.clientIP = ip;
  next();
};

// Record a violation (called from controller when prompt is BLOCKED)
const recordViolation = (ip) => {
  const record = getIPRecord(ip);
  const now = Date.now();

  // Add current violation
  record.violations.push(now);

  // Remove violations older than watch window (10 mins)
  record.violations = record.violations.filter(
    (timestamp) => now - timestamp < WATCH_WINDOW
  );

  console.log(`⚠️ VIOLATION: IP ${ip} — ${record.violations.length}/${MAX_VIOLATIONS} in last 10 mins`);

  // Check if threshold reached
  if (record.violations.length >= MAX_VIOLATIONS) {
    record.blockedUntil = now + BLOCK_DURATION;
    record.totalBlocks += 1;
    console.log(`🔒 BLOCKED: IP ${ip} for 15 minutes (offense #${record.totalBlocks})`);
    return {
      blocked: true,
      duration: BLOCK_DURATION,
      totalBlocks: record.totalBlocks,
    };
  }

  return {
    blocked: false,
    violationsCount: record.violations.length,
    remaining: MAX_VIOLATIONS - record.violations.length,
  };
};

// Get all blocked IPs (for dashboard)
const getBlockedIPs = () => {
  const now = Date.now();
  const blocked = [];

  ipStore.forEach((record, ip) => {
    if (record.blockedUntil && now < record.blockedUntil) {
      blocked.push({
        ip: maskIP(ip),
        blockedUntil: record.blockedUntil,
        remainingMinutes: Math.ceil((record.blockedUntil - now) / 60000),
        remainingSeconds: Math.ceil((record.blockedUntil - now) / 1000),
        violations: record.violations.length,
        totalBlocks: record.totalBlocks,
      });
    }
  });

  return blocked;
};

// Get all IP stats (for dashboard)
const getIPStats = () => {
  const now = Date.now();
  const stats = [];

  ipStore.forEach((record, ip) => {
    // Clean old violations
    const recentViolations = record.violations.filter(
      (t) => now - t < WATCH_WINDOW
    );

    if (recentViolations.length > 0 || record.totalBlocks > 0) {
      stats.push({
        ip: maskIP(ip),
        recentViolations: recentViolations.length,
        totalBlocks: record.totalBlocks,
        isBlocked: record.blockedUntil ? now < record.blockedUntil : false,
        remainingMinutes: record.blockedUntil && now < record.blockedUntil
          ? Math.ceil((record.blockedUntil - now) / 60000)
          : 0,
      });
    }
  });

  return stats;
};

// Mask IP for privacy (show partial)
const maskIP = (ip) => {
  if (ip === '::1' || ip === '127.0.0.1') return 'localhost';
  const parts = ip.replace('::ffff:', '').split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return ip.substring(0, 10) + '...';
};

module.exports = {
  checkRateLimit,
  recordViolation,
  getBlockedIPs,
  getIPStats,
};