import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { web3, setupContract, hotelBooking } from '../utils/web3';
import ipfs from '../utils/ipfs';

const BookingForm = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contractReady, setContractReady] = useState(false);

    useEffect(() => {
        const initContract = async () => {
            await setupContract();
            setContractReady(true);
        };

        initContract();
    }, []);

    const handleBooking = async () => {
        if (!contractReady) {
            alert("Contract is not ready yet. Please try again later.");
            return;
        }

        if (!userName || !userEmail || !password || !checkInDate || !checkOutDate) {
            alert("All fields must be filled out to book a room.");
            return;
        }

        try {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            const userInfo = {
                name: userName,
                email: userEmail,
                password: password
            };
            const added = await ipfs.add(JSON.stringify(userInfo));
            const ipfsHash = added.path;

            const checkInTimestamp = BigInt(Math.floor(new Date(checkInDate).getTime() / 1000));
            const checkOutTimestamp = BigInt(Math.floor(new Date(checkOutDate).getTime() / 1000));

            const room = await hotelBooking.methods.rooms(roomId).call();
            const price = BigInt(room.price);

            const gasPrice = await web3.eth.getGasPrice();

            await hotelBooking.methods.bookRoom(roomId, checkInTimestamp, checkOutTimestamp, ipfsHash)
                .send({ from: account, value: price.toString(), gasPrice });

            const bookingsCount = await hotelBooking.methods.getBookingsLength().call();
            const bookingId = Number(bookingsCount) - 1;
            navigate(`/booking-details/${bookingId}`);
        } catch (error) {
            console.error("Error during booking:", error);
            alert("Error during booking. See console for details.");
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Book a Room</h2>
                <p>Room ID: {roomId}</p>
                <input
                    type="text"
                    placeholder="Name"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Check-in Date"
                    value={checkInDate}
                    onChange={e => setCheckInDate(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="Check-out Date"
                    value={checkOutDate}
                    onChange={e => setCheckOutDate(e.target.value)}
                />
                <button onClick={handleBooking}>Book</button>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
