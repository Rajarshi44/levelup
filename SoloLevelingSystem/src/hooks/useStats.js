// src/hooks/useStats.js

import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { fetchUserStats, updateStatHistory } from '../services/progressService';

/**
 * Custom hook for managing user statistics
 * Provides tracking and visualization of user progress
 * 
 * @returns {Object} Stats methods and data
 */
const useStats = () => {
  const { user } = useSelector(state => state);
  const { quests } = useSelector(state => state);
  
  const [statsHistory, setStatsHistory] = useState([]);
  const [skillStats, setSkillStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [visualizationData, setVisualizationData] = useState({});

  // Stat categories for tracking
  const STAT_CATEGORIES = {
    PHYSICAL: 'PHYSICAL',
    PROGRAMMING: 'PROGRAMMING',
    DISCIPLINE: 'DISCIPLINE',
    SKILLS: 'SKILLS'
  };

  /**
   * Load statistics on initialization
   */
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const stats = await fetchUserStats();
        if (stats) {
          setStatsHistory(stats.history || []);
          setSkillStats(stats.skills || {});
        }
        generateVisualizationData(stats?.history || []);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  /**
   * Record daily statistics based on completed quests and activities
   */
  const recordDailyStats = useCallback(async () => {
    try {
      // Get today's date as string
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if we already recorded stats for today
      const existingEntry = statsHistory.find(entry => entry.date === today);
      if (existingEntry) {
        return; // Already recorded for today
      }
      
      // Calculate stats from completed quests
      const completedQuests = [
        ...quests.dailyQuests.filter(q => q.status === 'COMPLETED'),
        ...quests.weeklyQuests.filter(q => q.status === 'COMPLETED'),
        ...quests.customQuests.filter(q => q.status === 'COMPLETED'),
      ];
      
      // Count quests by category
      const physicalQuests = completedQuests.filter(q => q.category === STAT_CATEGORIES.PHYSICAL).length;
      const programmingQuests = completedQuests.filter(q => q.category === STAT_CATEGORIES.PROGRAMMING).length;
      const disciplineQuests = completedQuests.filter(q => q.category === STAT_CATEGORIES.DISCIPLINE).length;
      
      // Create stat entry
      const newStatEntry = {
        date: today,
        level: user.level,
        streak: user.streak,
        questsCompleted: completedQuests.length,
        physical: physicalQuests,
        programming: programmingQuests,
        discipline: disciplineQuests,
        experience: user.experience
      };
      
      // Update stat history
      const updatedHistory = [...statsHistory, newStatEntry];
      setStatsHistory(updatedHistory);
      
      // Update skills stats based on completed quests
      updateSkillStats(completedQuests);
      
      // Save to storage
      await updateStatHistory(updatedHistory, skillStats);
      
      // Update visualization data
      generateVisualizationData(updatedHistory);
      
      return newStatEntry;
    } catch (error) {
      console.error('Error recording daily stats:', error);
      return null;
    }
  }, [statsHistory, quests, user, skillStats]);

  /**
   * Update skill statistics based on completed quests
   * @param {Array} completedQuests - Array of completed quests
   */
  const updateSkillStats = useCallback((completedQuests) => {
    const updatedSkillStats = { ...skillStats };
    
    // Process each completed quest
    completedQuests.forEach(quest => {
      if (quest.skills && quest.skills.length > 0) {
        // Update each skill associated with the quest
        quest.skills.forEach(skill => {
          if (!updatedSkillStats[skill]) {
            updatedSkillStats[skill] = { 
              points: 0, 
              questsCompleted: 0,
              lastImproved: new Date().toISOString() 
            };
          }
          
          // Increase skill points based on quest difficulty
          const pointsToAdd = quest.difficulty === 'EASY' ? 1 :
                             quest.difficulty === 'MEDIUM' ? 2 :
                             quest.difficulty === 'HARD' ? 3 : 5; // EPIC
          
          updatedSkillStats[skill].points += pointsToAdd;
          updatedSkillStats[skill].questsCompleted += 1;
          updatedSkillStats[skill].lastImproved = new Date().toISOString();
        });
      }
    });
    
    setSkillStats(updatedSkillStats);
  }, [skillStats]);

  /**
   * Generate data for statistics visualizations
   * @param {Array} history - Stat history array
   */
  const generateVisualizationData = useCallback((history) => {
    // Daily activity chart data
    const dailyActivityData = history.slice(-7).map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      quests: entry.questsCompleted,
      physical: entry.physical,
      programming: entry.programming,
      discipline: entry.discipline
    }));
    
    // Weekly progress chart data
    const weeklyProgress = getWeeklyProgressData(history);
    
    // Skill distribution data
    const skillDistribution = Object.entries(skillStats).map(([skill, data]) => ({
      name: skill,
      value: data.points
    })).sort((a, b) => b.value - a.value);
    
    // Level progression data
    const levelProgressionData = history.map(entry => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      level: entry.level,
      experience: entry.experience
    }));
    
    setVisualizationData({
      dailyActivity: dailyActivityData,
      weeklyProgress,
      skillDistribution,
      levelProgression: levelProgressionData
    });
  }, [skillStats]);

  /**
   * Generate weekly progress aggregation
   * @param {Array} history - Stat history array
   * @returns {Array} Weekly aggregated data
   */
  const getWeeklyProgressData = useCallback((history) => {
    const weeklyData = [];
    
    // Group entries by week
    const weekGroups = {};
    
    history.forEach(entry => {
      const entryDate = parseISO(entry.date);
      const weekStart = format(startOfWeek(entryDate), 'yyyy-MM-dd');
      
      if (!weekGroups[weekStart]) {
        weekGroups[weekStart] = [];
      }
      
      weekGroups[weekStart].push(entry);
    });
    
    // Calculate weekly aggregates
    Object.entries(weekGroups).forEach(([weekStart, entries]) => {
      const startDate = parseISO(weekStart);
      const endDate = endOfWeek(startDate);
      
      const totalQuests = entries.reduce((sum, entry) => sum + entry.questsCompleted, 0);
      const totalPhysical = entries.reduce((sum, entry) => sum + entry.physical, 0);
      const totalProgramming = entries.reduce((sum, entry) => sum + entry.programming, 0);
      const totalDiscipline = entries.reduce((sum, entry) => sum + entry.discipline, 0);
      
      weeklyData.push({
        week: `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`,
        quests: totalQuests,
        physical: totalPhysical,
        programming: totalProgramming,
        discipline: totalDiscipline
      });
    });
    
    return weeklyData.slice(-4); // Last 4 weeks
  }, []);

  /**
   * Get skill ranking and levels
   * @returns {Array} Sorted skill levels
   */
  const getSkillLevels = useCallback(() => {
    return Object.entries(skillStats)
      .map(([skill, data]) => {
        // Calculate level based on points
        // Every 10 points is roughly a level
        const level = Math.floor(data.points / 10) + 1;
        const progress = (data.points % 10) * 10; // Progress to next level (%)
        
        return {
          name: skill,
          level,
          points: data.points,
          progress,
          questsCompleted: data.questsCompleted,
          lastImproved: data.lastImproved
        };
      })
      .sort((a, b) => b.level - a.level || b.progress - a.progress);
  }, [skillStats]);

  /**
   * Get progress summary for dashboard
   * @returns {Object} Progress summary
   */
  const getProgressSummary = useCallback(() => {
    if (statsHistory.length === 0) {
      return {
        totalDays: 0,
        questsCompleted: 0,
        physicalProgress: 0,
        programmingProgress: 0,
        disciplineProgress: 0,
        averageQuestsPerDay: 0
      };
    }

    const totalDays = statsHistory.length;
    
    // Calculate totals
    const totalQuests = statsHistory.reduce((sum, day) => sum + day.questsCompleted, 0);
    const totalPhysical = statsHistory.reduce((sum, day) => sum + day.physical, 0);
    const totalProgramming = statsHistory.reduce((sum, day) => sum + day.programming, 0);
    const totalDiscipline = statsHistory.reduce((sum, day) => sum + day.discipline, 0);
    
    // Calculate averages
    const averageQuestsPerDay = totalDays > 0 ? totalQuests / totalDays : 0;
    
    return {
      totalDays,
      questsCompleted: totalQuests,
      physicalProgress: totalPhysical,
      programmingProgress: totalProgramming,
      disciplineProgress: totalDiscipline,
      averageQuestsPerDay: parseFloat(averageQuestsPerDay.toFixed(1))
    };
  }, [statsHistory]);

  /**
   * Get improvement trend data
   * @returns {Object} Trend data
   */
  const getImprovementTrends = useCallback(() => {
    if (statsHistory.length < 7) {
      return {
        questTrend: 0,
        physicalTrend: 0,
        programmingTrend: 0,
        disciplineTrend: 0
      };
    }
    
    // Get last 7 days
    const lastWeek = statsHistory.slice(-7);
    
    // Get previous 7 days
    const prevWeek = statsHistory.slice(-14, -7);
    
    // Calculate totals for both weeks
    const lastWeekQuests = lastWeek.reduce((sum, day) => sum + day.questsCompleted, 0);
    const prevWeekQuests = prevWeek.reduce((sum, day) => sum + day.questsCompleted, 0);
    
    const lastWeekPhysical = lastWeek.reduce((sum, day) => sum + day.physical, 0);
    const prevWeekPhysical = prevWeek.reduce((sum, day) => sum + day.physical, 0);
    
    const lastWeekProgramming = lastWeek.reduce((sum, day) => sum + day.programming, 0);
