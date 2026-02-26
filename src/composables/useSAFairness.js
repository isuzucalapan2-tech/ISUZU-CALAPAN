import { ref, computed } from 'vue';

/**
 * useSAFairness - Composable for Service Advisor fairness algorithms
 * 
 * Provides weighted scoring system for SA assignment with:
 * - Workload balancing (40%)
 * - Performance metrics (30%)
 * - Availability scoring (20%)
 * - Round-robin rotation (10%)
 */

// Default weights (can be customized)
const DEFAULT_WEIGHTS = {
  workload: 0.4,
  performance: 0.3,
  availability: 0.2,
  rotation: 0.1
};

// Cache for expensive calculations
const calculationCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

export function useSAFairness(customWeights = null) {
  // Performance tracking data
  const saPerformanceData = ref({});
  const lastAssignmentTimes = ref({});
  const manualOverrideCount = ref({});
  
  // Use custom weights or defaults
  const weights = ref(customWeights || DEFAULT_WEIGHTS);
  
  // Validation for weights
  const validateWeights = () => {
    const total = Object.values(weights.value).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      console.warn('SA Fairness: Weights do not sum to 1.0, normalizing...');
      const factor = 1.0 / total;
      Object.keys(weights.value).forEach(key => {
        weights.value[key] *= factor;
      });
    }
  };
  
  validateWeights();


  /**
   * Calculate workload score for an SA
   * Lower ongoing assignments = higher score
   */
  const calculateWorkloadScore = (saName, ongoingCount, maxOngoing = 5) => {
    // Input validation
    if (!saName || typeof ongoingCount !== 'number' || ongoingCount < 0) {
      console.warn('SA Fairness: Invalid inputs for workload calculation', { saName, ongoingCount });
      return { score: 0, details: { error: 'Invalid inputs' } };
    }
    
    const cacheKey = `workload_${saName}_${ongoingCount}_${maxOngoing}`;
    const cached = calculationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    const normalizedScore = Math.max(0, 1 - (ongoingCount / maxOngoing));
    const result = {
      score: normalizedScore * weights.value.workload,
      details: {
        ongoingCount,
        maxOngoing,
        normalizedScore,
        weight: weights.value.workload
      }
    };
    
    calculationCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  };


  /**
   * Calculate performance score for an SA
   * Based on completion rate and average handling time
   */
  const calculatePerformanceScore = (saName, assignments) => {
    // Input validation
    if (!saName || !Array.isArray(assignments)) {
      console.warn('SA Fairness: Invalid inputs for performance calculation', { saName, assignments });
      return { score: weights.value.performance * 0.5, details: { error: 'Invalid inputs' } };
    }
    
    const cacheKey = `performance_${saName}_${assignments.length}`;
    const cached = calculationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    const saAssignments = assignments.filter(a => a.saName === saName);
    const completedAssignments = saAssignments.filter(a => a.status === 'JOB DONE');
    const cancelledAssignments = saAssignments.filter(a => a.status === 'CANCELLED');
    
    // Completion rate (0-1)
    const totalCompletedOrCancelled = completedAssignments.length + cancelledAssignments.length;
    const completionRate = totalCompletedOrCancelled > 0 
      ? completedAssignments.length / totalCompletedOrCancelled 
      : 0.5; // Default neutral score for new SAs
    
    // Calculate average handling time for completed assignments
    let avgHandlingTime = 0;
    let validHandlingTimeCount = 0;
    
    if (completedAssignments.length > 0) {
      const handlingTimes = completedAssignments.map(a => {
        if (a.completedDate && a.date) {
          const start = new Date(a.date);
          const end = new Date(a.completedDate);
          const hours = (end - start) / (1000 * 60 * 60);
          // Validate reasonable time range (1 min to 30 days)
          if (hours >= 0.016 && hours <= 720) {
            validHandlingTimeCount++;
            return hours;
          }
        }
        return null;
      }).filter(h => h !== null);
      
      if (handlingTimes.length > 0) {
        // Remove outliers (values > 2 standard deviations)
        const mean = handlingTimes.reduce((a, b) => a + b, 0) / handlingTimes.length;
        const variance = handlingTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / handlingTimes.length;
        const stdDev = Math.sqrt(variance);
        const filteredTimes = handlingTimes.filter(h => Math.abs(h - mean) <= 2 * stdDev);
        
        avgHandlingTime = filteredTimes.length > 0 
          ? filteredTimes.reduce((a, b) => a + b, 0) / filteredTimes.length 
          : mean;
      } else {
        avgHandlingTime = 24; // Default for new SAs
      }
    } else {
      avgHandlingTime = 24; // Default for new SAs
    }
    
    // Normalize handling time (faster = better, max 48 hours considered)
    const handlingTimeScore = Math.max(0, 1 - (avgHandlingTime / 48));
    
    // Combined performance score with exponential decay for old data
    const daysSinceLastAssignment = lastAssignmentTimes.value[saName] 
      ? (Date.now() - new Date(lastAssignmentTimes.value[saName]).getTime()) / (1000 * 60 * 60 * 24)
      : 30;
    const recencyFactor = Math.exp(-daysSinceLastAssignment / 30); // Decay over 30 days
    
    const performanceScore = ((completionRate * 0.7) + (handlingTimeScore * 0.3)) * (0.5 + 0.5 * recencyFactor);
    
    const result = {
      score: Math.min(1, performanceScore) * weights.value.performance,
      details: {
        completionRate,
        avgHandlingTime: avgHandlingTime.toFixed(2),
        handlingTimeScore: handlingTimeScore.toFixed(3),
        totalCompleted: completedAssignments.length,
        totalCancelled: cancelledAssignments.length,
        recencyFactor: recencyFactor.toFixed(3),
        weight: weights.value.performance
      }
    };
    
    calculationCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  };


  /**
   * Calculate availability score for an SA
   * AVAILABLE > IDLE > WORKING > others
   */
  const calculateAvailabilityScore = (saStatus) => {
    const statusScores = {
      'AVAILABLE': 1.0,
      'IDLE': 0.8,
      'WORKING': 0.5,
      'BUSY': 0.0,
      'ABSENT': 0.0
    };
    
    const score = statusScores[saStatus] || 0.3;
    
    return {
      score: score * weights.value.availability,
      details: {
        saStatus,
        statusScore: score,
        weight: weights.value.availability
      }
    };
  };


  /**
   * Calculate rotation score for an SA
   * Time since last assignment - longer = higher score
   */
  const calculateRotationScore = (saName) => {
    if (!saName) {
      return { score: 0, details: { error: 'Invalid SA name' } };
    }
    
    const lastAssignment = lastAssignmentTimes.value[saName];
    const now = new Date();
    
    let hoursSinceLastAssignment = 48; // Default high value for new SAs
    
    if (lastAssignment) {
      const lastDate = new Date(lastAssignment);
      hoursSinceLastAssignment = Math.max(0, (now - lastDate) / (1000 * 60 * 60));
    }
    
    // Normalize: max benefit at 24+ hours, diminishing returns after 48
    // Use sigmoid function for smoother curve
    const normalizedHours = Math.min(hoursSinceLastAssignment, 72); // Cap at 72 hours
    const rotationScore = 1 / (1 + Math.exp(-0.1 * (normalizedHours - 24))); // Sigmoid centered at 24h
    
    return {
      score: rotationScore * weights.value.rotation,
      details: {
        hoursSinceLastAssignment: Math.round(hoursSinceLastAssignment),
        rotationScore: rotationScore.toFixed(3),
        weight: weights.value.rotation
      }
    };
  };


  /**
   * Calculate total weighted score for an SA
   */
  const calculateTotalScore = (sa, assignments, ongoingCount) => {
    const workload = calculateWorkloadScore(sa.saName, ongoingCount);
    const performance = calculatePerformanceScore(sa.saName, assignments);
    const availability = calculateAvailabilityScore(sa.saStatus);
    const rotation = calculateRotationScore(sa.saName);
    
    const totalScore = workload.score + performance.score + availability.score + rotation.score;
    
    return {
      saName: sa.saName,
      saStatus: sa.saStatus,
      totalScore,
      breakdown: {
        workload,
        performance,
        availability,
        rotation
      },
      isManualOverride: false
    };
  };

  /**
   * Get ranked list of SAs for assignment
   */
  const getRankedSAs = (serviceAdvisors, assignments, excludeSA = null) => {
    const availableSAs = serviceAdvisors.filter(sa => 
      sa.saStatus !== 'BUSY' && sa.saStatus !== 'ABSENT' && sa.saName !== excludeSA
    );
    
    if (availableSAs.length === 0) return [];
    
    const scoredSAs = availableSAs.map(sa => {
      const ongoingCount = assignments.filter(
        a => a.saName === sa.saName && a.status === 'ON GOING'
      ).length;
      
      return calculateTotalScore(sa, assignments, ongoingCount);
    });
    
    // Sort by total score (descending)
    return scoredSAs.sort((a, b) => b.totalScore - a.totalScore);
  };

  /**
   * Get the best SA for assignment with detailed reasoning
   */
  const getBestSA = (serviceAdvisors, assignments, selectedPRO = null) => {
    const rankedSAs = getRankedSAs(serviceAdvisors, assignments);
    
    if (rankedSAs.length === 0) {
      return null;
    }
    
    const bestSA = rankedSAs[0];
    
    // Generate reasoning based on highest contributing factor
    const breakdown = bestSA.breakdown;
    let reason = '';
    let icon = '';
    
    // Find the highest scoring component
    const scores = [
      { name: 'workload', score: breakdown.workload.score, label: 'Light Workload', icon: '📊' },
      { name: 'performance', score: breakdown.performance.score, label: 'High Performance', icon: '⭐' },
      { name: 'availability', score: breakdown.availability.score, label: 'Available', icon: '✅' },
      { name: 'rotation', score: breakdown.rotation.score, label: 'Rotation Priority', icon: '🔄' }
    ];
    
    const highestScore = scores.reduce((max, current) => 
      current.score > max.score ? current : max
    );
    
    reason = `${highestScore.icon} ${highestScore.label}`;
    
    // Add secondary reason if close
    const secondary = scores.find(s => 
      s.name !== highestScore.name && s.score > 0.15
    );
    
    if (secondary) {
      reason += ` + ${secondary.icon}`;
    }
    
    return {
      saName: bestSA.saName,
      totalScore: bestSA.totalScore,
      reason,
      breakdown: bestSA.breakdown,
      allRankings: rankedSAs.slice(0, 3), // Top 3 for display
      isManualOverride: false
    };
  };

  /**
   * Update last assignment time for an SA
   */
  const recordAssignment = (saName, isManualOverride = false) => {
    lastAssignmentTimes.value[saName] = new Date().toISOString();
    
    if (isManualOverride) {
      manualOverrideCount.value[saName] = (manualOverrideCount.value[saName] || 0) + 1;
    }
  };

  /**
   * Get workload statistics for all SAs
   */
  const getWorkloadStats = (serviceAdvisors, assignments) => {
    // Input validation
    if (!Array.isArray(serviceAdvisors) || !Array.isArray(assignments)) {
      console.warn('SA Fairness: Invalid inputs for workload stats', { serviceAdvisors, assignments });
      return { saStats: [], fairness: { averageOngoing: 0, maxOngoing: 0, minOngoing: 0, balanceScore: 0, isBalanced: true } };
    }
    
    const today = new Date().toDateString();
    
    const stats = serviceAdvisors.map(sa => {
      const ongoing = assignments.filter(a => 
        a.saName === sa.saName && a.status === 'ON GOING'
      ).length;
      
      const completedToday = assignments.filter(a => {
        if (a.saName !== sa.saName || a.status !== 'JOB DONE') return false;
        try {
          return new Date(a.date).toDateString() === today;
        } catch (e) {
          return false;
        }
      }).length;
      
      const totalCompleted = assignments.filter(a => 
        a.saName === sa.saName && a.status === 'JOB DONE'
      ).length;
      
      const totalCancelled = assignments.filter(a => 
        a.saName === sa.saName && a.status === 'CANCELLED'
      ).length;
      
      const total = totalCompleted + totalCancelled;
      const completionRate = total > 0 ? (totalCompleted / total * 100).toFixed(1) : '0.0';
      
      // Workload level indicator with color coding
      let workloadLevel = 'low';
      let workloadColor = 'green';
      if (ongoing >= 4) {
        workloadLevel = 'high';
        workloadColor = 'red';
      } else if (ongoing >= 3) {
        workloadLevel = 'high';
        workloadColor = 'orange';
      } else if (ongoing >= 2) {
        workloadLevel = 'medium';
        workloadColor = 'yellow';
      }
      
      // Calculate trend (compare to yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const yesterdayCompleted = assignments.filter(a => {
        if (a.saName !== sa.saName || a.status !== 'JOB DONE') return false;
        try {
          return new Date(a.date).toDateString() === yesterdayStr;
        } catch (e) {
          return false;
        }
      }).length;
      
      const trend = completedToday > yesterdayCompleted ? 'up' : 
                    completedToday < yesterdayCompleted ? 'down' : 'stable';
      
      return {
        saName: sa.saName,
        saStatus: sa.saStatus,
        ongoing,
        completedToday,
        yesterdayCompleted,
        totalCompleted,
        completionRate,
        workloadLevel,
        workloadColor,
        trend,
        isAvailable: sa.saStatus !== 'BUSY' && sa.saStatus !== 'ABSENT',
        manualOverrides: manualOverrideCount.value[sa.saName] || 0
      };
    });
    
    // Calculate fairness metrics with standard deviation
    const ongoingCounts = stats.map(s => s.ongoing);
    const avgOngoing = ongoingCounts.reduce((a, b) => a + b, 0) / ongoingCounts.length || 0;
    const maxOngoing = Math.max(...ongoingCounts, 0);
    const minOngoing = Math.min(...ongoingCounts, 0);
    
    // Calculate standard deviation
    const variance = ongoingCounts.reduce((acc, count) => acc + Math.pow(count - avgOngoing, 2), 0) / ongoingCounts.length || 0;
    const stdDev = Math.sqrt(variance);
    
    // Balance score: 100 = perfect balance, 0 = completely unbalanced
    const balanceScore = maxOngoing > 0 
      ? Math.max(0, 100 - (stdDev / maxOngoing) * 100) 
      : 100;
    
    // Identify overloaded SAs
    const overloadedSAs = stats.filter(s => s.ongoing > avgOngoing + stdDev).map(s => s.saName);
    const underloadedSAs = stats.filter(s => s.ongoing < avgOngoing - stdDev && s.isAvailable).map(s => s.saName);
    
    return {
      saStats: stats,
      fairness: {
        averageOngoing: avgOngoing.toFixed(1),
        maxOngoing,
        minOngoing,
        stdDev: stdDev.toFixed(2),
        balanceScore: balanceScore.toFixed(1),
        isBalanced: balanceScore >= 80,
        overloadedSAs,
        underloadedSAs,
        recommendation: overloadedSAs.length > 0 
          ? `Consider redistributing from ${overloadedSAs.join(', ')}` 
          : 'Workload is well balanced'
      }
    };
  };


  /**
   * Check if manual override would impact fairness significantly
   */
  const checkFairnessImpact = (selectedSA, recommendedSA, serviceAdvisors, assignments) => {
    if (!recommendedSA || selectedSA === recommendedSA.saName) {
      return { wouldImpact: false, message: '' };
    }
    
    const stats = getWorkloadStats(serviceAdvisors, assignments);
    const selectedStats = stats.saStats.find(s => s.saName === selectedSA);
    const recommendedStats = stats.saStats.find(s => s.saName === recommendedSA.saName);
    
    if (!selectedStats || !recommendedStats) {
      return { wouldImpact: false, message: '' };
    }
    
    const ongoingDiff = selectedStats.ongoing - recommendedStats.ongoing;
    
    if (ongoingDiff >= 2) {
      return {
        wouldImpact: true,
        message: `⚠️ ${selectedSA} has ${ongoingDiff} more ongoing assignments than the recommended ${recommendedSA.saName}`,
        severity: 'high'
      };
    } else if (ongoingDiff >= 1) {
      return {
        wouldImpact: true,
        message: `ℹ️ ${selectedSA} has ${ongoingDiff} more ongoing assignment(s) than recommended`,
        severity: 'medium'
      };
    }
    
    return { wouldImpact: false, message: '' };
  };

  /**
   * Get assignment analytics
   */
  const getAnalytics = (assignments, days = 7) => {
    // Input validation
    if (!Array.isArray(assignments)) {
      console.warn('SA Fairness: Invalid assignments for analytics');
      return {
        totalRecent: 0,
        dailyDistribution: {},
        statusDistribution: { 'ON GOING': 0, 'JOB DONE': 0, 'CANCELLED': 0 },
        peakHour: null,
        averagePerDay: '0.0',
        efficiency: 0
      };
    }
    
    const now = new Date();
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const recentAssignments = assignments.filter(a => {
      try {
        return new Date(a.date) >= daysAgo;
      } catch (e) {
        return false;
      }
    });
    
    // Daily distribution
    const dailyDistribution = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyDistribution[dateKey] = 0;
    }
    
    recentAssignments.forEach(a => {
      try {
        const dateKey = new Date(a.date).toISOString().split('T')[0];
        if (dailyDistribution[dateKey] !== undefined) {
          dailyDistribution[dateKey]++;
        }
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    // Status distribution
    const statusDistribution = {
      'ON GOING': recentAssignments.filter(a => a.status === 'ON GOING').length,
      'JOB DONE': recentAssignments.filter(a => a.status === 'JOB DONE').length,
      'CANCELLED': recentAssignments.filter(a => a.status === 'CANCELLED').length
    };
    
    // Peak hours (if timestamp available)
    const hourDistribution = {};
    recentAssignments.forEach(a => {
      if (a.timestamp) {
        try {
          const hour = new Date(a.timestamp).getHours();
          hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
        } catch (e) {
          // Skip invalid timestamps
        }
      }
    });
    
    const peakHour = Object.entries(hourDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Calculate efficiency (completed / total)
    const totalCompleted = statusDistribution['JOB DONE'];
    const total = recentAssignments.length;
    const efficiency = total > 0 ? (totalCompleted / total * 100).toFixed(1) : 0;
    
    // Calculate trend (compare first half to second half of period)
    const midPoint = Math.floor(days / 2);
    const firstHalf = Object.values(dailyDistribution).slice(0, midPoint).reduce((a, b) => a + b, 0);
    const secondHalf = Object.values(dailyDistribution).slice(midPoint).reduce((a, b) => a + b, 0);
    const trend = secondHalf > firstHalf ? 'increasing' : 
                  secondHalf < firstHalf ? 'decreasing' : 'stable';
    
    return {
      totalRecent: recentAssignments.length,
      dailyDistribution,
      statusDistribution,
      peakHour: peakHour ? { hour: parseInt(peakHour[0]), count: peakHour[1] } : null,
      averagePerDay: (recentAssignments.length / days).toFixed(1),
      efficiency,
      trend,
      period: days
    };
  };

  /**
   * Reset all fairness data (for testing or new period)
   */
  const resetFairnessData = () => {
    saPerformanceData.value = {};
    lastAssignmentTimes.value = {};
    manualOverrideCount.value = {};
    calculationCache.clear();
    console.log('SA Fairness: All data reset');
  };

  /**
   * Update weights dynamically
   */
  const updateWeights = (newWeights) => {
    weights.value = { ...weights.value, ...newWeights };
    validateWeights();
    calculationCache.clear(); // Clear cache as calculations depend on weights
    console.log('SA Fairness: Weights updated', weights.value);
  };

  /**
   * Export fairness data for persistence
   */
  const exportData = () => {
    return {
      lastAssignmentTimes: lastAssignmentTimes.value,
      manualOverrideCount: manualOverrideCount.value,
      weights: weights.value,
      timestamp: new Date().toISOString()
    };
  };

  /**
   * Import fairness data from persistence
   */
  const importData = (data) => {
    if (data.lastAssignmentTimes) {
      lastAssignmentTimes.value = data.lastAssignmentTimes;
    }
    if (data.manualOverrideCount) {
      manualOverrideCount.value = data.manualOverrideCount;
    }
    if (data.weights) {
      weights.value = data.weights;
      validateWeights();
    }
    console.log('SA Fairness: Data imported');
  };


  return {
    // Main methods
    getBestSA,
    getRankedSAs,
    calculateTotalScore,
    recordAssignment,
    getWorkloadStats,
    checkFairnessImpact,
    getAnalytics,
    
    // Data management
    resetFairnessData,
    updateWeights,
    exportData,
    importData,
    
    // State (for external access if needed)
    lastAssignmentTimes,
    manualOverrideCount,
    weights,
    
    // Individual calculators (for testing/debugging)
    calculateWorkloadScore,
    calculatePerformanceScore,
    calculateAvailabilityScore,
    calculateRotationScore,
    
    // Constants
    DEFAULT_WEIGHTS
  };
}
