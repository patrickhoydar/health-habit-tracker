import React, { useContext, useMemo } from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Card, 
  CardHeader, 
  CardBody,
  Text
} from '@chakra-ui/react';
import { DataContext } from '../context/DataContext';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';

const Dashboard = () => {
  const { habits, coughLogs } = useContext(DataContext);
  
  // Get today and last 7 days date range
  const today = new Date();
  const last7Days = subDays(today, 7);
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Calculate stats
  const stats = useMemo(() => {
    // Habit completion rate
    const completedHabits = habits.reduce((total, habit) => {
      if (habit.entries && habit.entries[todayStr] && habit.entries[todayStr].completed) {
        return total + 1;
      }
      return total;
    }, 0);
    
    const habitCompletionRate = habits.length > 0 
      ? Math.round((completedHabits / habits.length) * 100) 
      : 0;
    
    // Recent cough incidents
    const recentCoughs = coughLogs.filter(log => {
      const logDate = parseISO(log.timestamp);
      return isWithinInterval(logDate, { start: last7Days, end: today });
    });
    
    // Top triggers
    const triggerCounts = recentCoughs.reduce((counts, log) => {
      if (log.possibleTriggers) {
        log.possibleTriggers.forEach(trigger => {
          counts[trigger] = (counts[trigger] || 0) + 1;
        });
      }
      return counts;
    }, {});
    
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger, count]) => ({ trigger, count }));
    
    return {
      totalHabits: habits.length,
      habitCompletionRate,
      totalCoughIncidents: coughLogs.length,
      recentCoughIncidents: recentCoughs.length,
      topTriggers
    };
  }, [habits, coughLogs, todayStr, last7Days, today]);
  
  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat as={Card} p={4}>
          <StatLabel>Total Habits</StatLabel>
          <StatNumber>{stats.totalHabits}</StatNumber>
          <StatHelpText>Tracked habits</StatHelpText>
        </Stat>
        
        <Stat as={Card} p={4}>
          <StatLabel>Today's Completion</StatLabel>
          <StatNumber>{stats.habitCompletionRate}%</StatNumber>
          <StatHelpText>Habits completed today</StatHelpText>
        </Stat>
        
        <Stat as={Card} p={4}>
          <StatLabel>Total Cough Incidents</StatLabel>
          <StatNumber>{stats.totalCoughIncidents}</StatNumber>
          <StatHelpText>All recorded incidents</StatHelpText>
        </Stat>
        
        <Stat as={Card} p={4}>
          <StatLabel>Recent Cough Incidents</StatLabel>
          <StatNumber>{stats.recentCoughIncidents}</StatNumber>
          <StatHelpText>Last 7 days</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Potential Cough Triggers</Heading>
          </CardHeader>
          <CardBody>
            {stats.topTriggers.length > 0 ? (
              stats.topTriggers.map((item, index) => (
                <Box key={index} mb={2}>
                  <Text fontWeight="medium">
                    {item.trigger} <Text as="span" color="gray.500">({item.count} incidents)</Text>
                  </Text>
                </Box>
              ))
            ) : (
              <Text color="gray.500">No triggers identified yet</Text>
            )}
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            {coughLogs.length > 0 ? (
              coughLogs
                .slice(0, 5)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((log) => (
                  <Box key={log.id} mb={2}>
                    <Text fontWeight="medium">
                      {format(parseISO(log.timestamp), 'MMM dd, h:mm a')} 
                      <Text as="span" ml={2} color="gray.500">
                        Severity: {log.severity}/10
                      </Text>
                    </Text>
                  </Box>
                ))
            ) : (
              <Text color="gray.500">No activity recorded yet</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;