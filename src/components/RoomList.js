import React, { useEffect, useState } from 'react';
import { hotelBooking, setupContract, web3 } from '../utils/web3';
import { Link } from 'react-router-dom';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                await setupContract();
                const rooms = await hotelBooking.methods.getRooms().call();
                console.log("Rooms fetched from contract:", rooms);
                setRooms(rooms);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                setIsLoading(false);
            }
        };
        fetchRooms();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Available Rooms</h2>
            <ul>
                {rooms.length > 0 ? (
                    rooms.map(room => (
                        <li key={room.id}>
                            {room.name} - {web3.utils.fromWei(room.price.toString(), 'ether')} ETH - 
                            {room.isBooked ? 'Booked' : <Link to={`/book/${room.id}`}>Book Now</Link>}
                        </li>
                    ))
                ) : (
                    <li>No rooms available</li>
                )}
            </ul>
            <Link to="/cancel-booking">
                <button>Cancel Booking</button>
            </Link>
        </div>
    );
};

export default RoomList;
