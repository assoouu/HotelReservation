import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { web3, hotelBooking, setupContract } from '../utils/web3';
import ipfs from '../utils/ipfs';

const CancelBooking = () => {
    const [roomId, setRoomId] = useState('');
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [refundAmount, setRefundAmount] = useState(BigInt(0));
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            await setupContract();
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
        };
        init();
    }, []);

    const handleCancel = async () => {
        if (!roomId || !password) {
            alert("Room ID and Password must be filled out to cancel a booking.");
            return;
        }

        try {
            if (!web3 || !hotelBooking) {
                alert('Web3 or contract not initialized properly. Please check your setup.');
                return;
            }

            if (!account) {
                alert('Account not loaded yet. Please try again.');
                return;
            }

            const roomBooking = await hotelBooking.methods.roomBookings(roomId).call();
            console.log("Room Booking:", roomBooking);

            const ipfsHash = roomBooking.ipfsHash;
            let fileContent = '';
            for await (const chunk of ipfs.cat(ipfsHash)) {
                fileContent += new TextDecoder("utf-8").decode(chunk);
            }

            try {
                const userInfo = JSON.parse(fileContent);
                console.log("User Info: ", userInfo);

                if (userInfo.password !== password) {
                    alert('Incorrect password. Cancellation not allowed.');
                    return;
                }

                const bookingTime = BigInt(roomBooking.bookingTime);
                const price = BigInt((await hotelBooking.methods.rooms(roomId).call()).price);
                console.log("Room Price:", price);

                const elapsed = BigInt(Math.floor(Date.now() / 1000)) - bookingTime;
                let refundPercentage = BigInt(0);

                if (elapsed < BigInt(60)) {
                    refundPercentage = BigInt(100);
                } else if (elapsed < BigInt(120)) {
                    refundPercentage = BigInt(90);
                } else if (elapsed < BigInt(180)) {
                    refundPercentage = BigInt(80);
                } else if (elapsed < BigInt(240)) {
                    refundPercentage = BigInt(70);
                } else if (elapsed < BigInt(300)) {
                    refundPercentage = BigInt(60);
                }

                const refund = (price * refundPercentage) / BigInt(100);
                setRefundAmount(refund);
                console.log("Refund Amount:", refund);

                const gasPrice = await web3.eth.getGasPrice();

                await hotelBooking.methods.cancelBooking(roomId)
                    .send({ from: account, gasPrice: gasPrice });

                alert(`Booking cancelled successfully! Refund amount: ${web3.utils.fromWei(refund.toString(), 'ether')} ETH`);
                navigate('/');
            } catch (jsonError) {
                console.error('Invalid JSON format:', fileContent);
                alert('Error during cancellation. Invalid user information format.');
            }

        } catch (error) {
            console.error('Error during cancellation:', error);
            alert('Error during cancellation. See console for details.');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2>Cancel Booking</h2>
                <input type="number" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={handleCancel}>Cancel</button>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/')}>Home</button>
                </div>
                {refundAmount > BigInt(0) && (
                    <p>Refund Amount: {web3.utils.fromWei(refundAmount.toString(), 'ether')} ETH</p>
                )}
            </div>
        </div>
    );
};

export default CancelBooking;
