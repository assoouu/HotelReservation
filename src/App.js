// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import CancelBooking from './components/CancelBooking';
import RoomList from './components/RoomList';
import BookingDetails from './components/BookingDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomList />} />
        <Route path="/book/:roomId" element={<BookingForm />} />
        <Route path="/cancel-booking" element={<CancelBooking />} />
        <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
