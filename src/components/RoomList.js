import React, { useEffect, useState } from 'react';
import { hotelBooking, setupContract, web3 } from '../utils/web3';
import { Link } from 'react-router-dom';
import './RoomList.css'; // CSS 파일을 임포트합니다.

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
        <div className="container">
            <div className="room-list-container">
                <h1>7팀 객실 예약 시스템</h1> {/* 제목을 RoomList.js로 옮김 */}
                <h2>객실 목록</h2>
                <ul className="room-list">
                    {rooms.length > 0 ? (
                        rooms.map(room => (
                            <li key={room.id} className="room-card">
                                <div className="room-info">
                                    <span className="room-name">{room.name}</span>
                                    <span className="room-price">{web3.utils.fromWei(room.price.toString(), 'ether')} ETH</span>
                                </div>
                                <div className="room-action">
                                    {room.isBooked ? 'Booked' : <Link to={`/book/${room.id}`}><button>예약</button></Link>}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>No rooms available</li>
                    )}
                </ul>
                <Link to="/cancel-booking">
                    <button>예약 취소</button>
                </Link>
            </div>
        </div>
    );
};

export default RoomList;
