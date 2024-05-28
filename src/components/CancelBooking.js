import React, { useState, useEffect } from 'react';
import { web3, hotelBooking, setupContract } from '../utils/web3';

const CancelBooking = () => {
    const [roomId, setRoomId] = useState('');
    const [account, setAccount] = useState('');
    const [refundAmount, setRefundAmount] = useState(BigInt(0)); // Initialize as BigInt

    useEffect(() => {
        // Fetch account and setup contract when component mounts
        const init = async () => {
            await setupContract();
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
        };
        init();
    }, []);

    const handleCancel = async () => {
        try {
            // Ensure web3 and hotelBooking are initialized
            if (!web3 || !hotelBooking) {
                alert('Web3 or contract not initialized properly. Please check your setup.');
                return;
            }

            // Ensure account is set before proceeding
            if (!account) {
                alert('Account not loaded yet. Please try again.');
                return;
            }

            const roomBooking = await hotelBooking.methods.roomBookings(roomId).call();
            console.log("Room Booking:", roomBooking);

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

            const gasPrice = await web3.eth.getGasPrice(); // Get current gas price

            await hotelBooking.methods.cancelBooking(roomId)
                .send({ from: account, gasPrice: gasPrice }); // Specify the from address and gas price

            alert(`Booking cancelled successfully! Refund amount: ${web3.utils.fromWei(refund.toString(), 'ether')} ETH`);
        } catch (error) {
            console.error('Error during cancellation:', error);
            alert('Error during cancellation. See console for details.');
        }
    };

    return (
        <div>
            <h2>Cancel Booking</h2>
            <input type="number" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
            <button onClick={handleCancel}>Cancel</button>
            {refundAmount > BigInt(0) && ( // Check for BigInt zero
                <p>Refund Amount: {web3.utils.fromWei(refundAmount.toString(), 'ether')} ETH</p>
            )}
        </div>
    );
};

export default CancelBooking;
