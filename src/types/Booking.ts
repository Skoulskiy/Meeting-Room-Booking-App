export interface Booking {
  id: string;
  roomId: string;
  creatorId: string; 
  title: string;
  date: string;
  startTime: string; 
  endTime: string; 
  participants: string[];
}