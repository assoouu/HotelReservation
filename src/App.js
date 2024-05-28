import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RoomList from './components/RoomList';
import BookingForm from './components/BookingForm';
import CancelBooking from './components/CancelBooking';

function App() {
    return (
        <Router>
            <div>
                <h1>Hotel Booking Dapp</h1>
                {/* 라우트 설정 */}
                <Routes>
                    {/* 기본 경로에서 RoomList 컴포넌트 렌더링 */}
                    <Route path="/" element={<RoomList />} />
                    <Route path="/book/:roomId" element={<BookingForm />} />                                         
                    <Route path="/cancel-booking" element={<CancelBooking />} />
                </Routes>   
            </div>
        </Router>
    );
}

export default App;
