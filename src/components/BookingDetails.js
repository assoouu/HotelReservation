import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { web3, hotelBooking, setupContract } from '../utils/web3';
import ipfs from '../utils/ipfs';

const BookingDetails = () => {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [room, setRoom] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookingDetails = async () => {
            await setupContract();
            const booking = await hotelBooking.methods.bookings(bookingId).call();
            setBooking(booking);
            
            const room = await hotelBooking.methods.rooms(booking.roomId).call();
            setRoom(room);

            let fileContent = '';
            for await (const chunk of ipfs.cat(booking.ipfsHash)) {
                fileContent += new TextDecoder("utf-8").decode(chunk);
            }
            const userInfo = JSON.parse(fileContent);
            setUserInfo(userInfo);
        };

        fetchBookingDetails();
    }, [bookingId]);

    if (!booking || !room || !userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <div className="details-container">
                <h2>Booking Details</h2>
                <p><strong>Room Name:</strong> {room.name}</p>
                <p><strong>Price:</strong> {web3.utils.fromWei(room.price.toString(), 'ether')} ETH</p>
                <p><strong>Check-in Date:</strong> {new Date(Number(booking.checkInDate) * 1000).toLocaleDateString()}</p>
                <p><strong>Check-out Date:</strong> {new Date(Number(booking.checkOutDate) * 1000).toLocaleDateString()}</p>
                <h3>User Information</h3>
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
