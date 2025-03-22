import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Checkbox,
  Textarea,
  Badge,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Flex,
  useToast
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { DataContext } from '../context/DataContext';

const HabitTracker = () => {
  const { habits, addHabit, updateHabit, deleteHabit, logHabitEntry } = useContext(DataContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'health',
    entries: {},
    dateCreated: new Date().toISOString()
  });
  const [editingId, setEditingId] = useState(null);
  const [habitNotes, setHabitNotes] = useState('');
  const toast = useToast();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHabit({ ...newHabit, [name]: value });
  };
  
  const openAddModal = () => {
    setEditingId(null);
    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      category: 'health',
      entries: {},
      dateCreated: new Date().toISOString()
    });
    onOpen();
  };
  
  const openEditModal = (habit) => {
    setEditingId(habit.id);
    setNewHabit(habit);
    onOpen();
  };
  
  const handleSaveHabit = () => {
    if (!newHabit.name) {
      toast({
        title: 'Error',
        description: 'Habit name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (editingId) {
      updateHabit(editingId, newHabit);
      toast({
        title: 'Habit updated',
        status: 'success',
        duration: 2000,
      });
    } else {
      addHabit(newHabit);
      toast({
        title: 'Habit added',
        status: 'success',
        duration: 2000,
      });
    }
    
    onClose();
  };
  
  const handleDeleteHabit = (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(id);
      toast({
        title: 'Habit deleted',
        status: 'info',
        duration: 2000,
      });
    }
  };
  
  const toggleHabitCompletion = (habitId, currentCompleted) => {
    const entryData = habits.find(h => h.id === habitId)?.entries?.[today] || {};
    logHabitEntry(habitId, today, !currentCompleted, entryData.notes || '');
  };
  
  const saveHabitNotes = (habitId) => {
    const entryData = habits.find(h => h.id === habitId)?.entries?.[today] || {};
    logHabitEntry(habitId, today, entryData.completed || false, habitNotes);
    setHabitNotes('');
    
    toast({
      title: 'Notes saved',
      status: 'success',
      duration: 2000,
    });
  };
  
  const getCategoryColor = (category) => {
    switch (category) {
      case 'health':
        return 'green';
      case 'productivity':
        return 'blue';
      case 'wellness':
        return 'purple';
      case 'lifestyle':
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={6}>
        <Heading>Habit Tracker</Heading>
        <Button colorScheme="blue" onClick={openAddModal}>
          Add New Habit
        </Button>
      </Flex>
      
      <VStack spacing={4} align="stretch">
        {habits.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={8}>
            No habits added yet. Click the button above to create your first habit.
          </Text>
        ) : (
          habits.map((habit) => {
            const isCompleted = habit.entries?.[today]?.completed || false;
            const noteForToday = habit.entries?.[today]?.notes || '';
            
            return (
              <Card key={habit.id} variant="outline">
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Heading size="md">{habit.name}</Heading>
                      <Badge colorScheme={getCategoryColor(habit.category)} mt={1}>
                        {habit.category}
                      </Badge>
                      <Badge ml={2} colorScheme="gray">
                        {habit.frequency}
                      </Badge>
                    </Box>
                    <HStack>
                      <Button size="sm" onClick={() => openEditModal(habit)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline"
                        onClick={() => handleDeleteHabit(habit.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Flex>
                </CardHeader>
                
                <CardBody>
                  <Text mb={4}>{habit.description}</Text>
                  
                  <Box borderTop="1px" borderColor="gray.200" pt={4}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontWeight="bold">Today's Status</Text>
                      <Checkbox 
                        isChecked={isCompleted}
                        onChange={() => toggleHabitCompletion(habit.id, isCompleted)}
                        colorScheme="green"
                        size="lg"
                      >
                        {isCompleted ? 'Completed' : 'Mark as completed'}
                      </Checkbox>
                    </Flex>
                    
                    <Box>
                      <FormControl>
                        <FormLabel>Notes (optional)</FormLabel>
                        <Textarea 
                          placeholder="Add notes for today..." 
                          value={habitNotes || noteForToday}
                          onChange={(e) => setHabitNotes(e.target.value)}
                          mb={2}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => saveHabitNotes(habit.id)}
                          colorScheme="blue"
                        >
                          Save Notes
                        </Button>
                      </FormControl>
                    </Box>
                  </Box>
                </CardBody>
              </Card>
            );
          })
        )}
      </VStack>
      
      {/* Add/Edit Habit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingId ? 'Edit Habit' : 'Add New Habit'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Habit Name</FormLabel>
                <Input 
                  name="name"
                  value={newHabit.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Drink Water, Take Medication"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={newHabit.description}
                  onChange={handleInputChange}
                  placeholder="Optional details about this habit"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select 
                  name="category"
                  value={newHabit.category}
                  onChange={handleInputChange}
                >
                  <option value="health">Health</option>
                  <option value="productivity">Productivity</option>
                  <option value="wellness">Wellness</option>
                  <option value="lifestyle">Lifestyle</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Frequency</FormLabel>
                <Select 
                  name="frequency"
                  value={newHabit.frequency}
                  onChange={handleInputChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="weekly">Weekly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveHabit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default HabitTracker;