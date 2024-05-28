import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { web3, hotelBooking, setupContract } from '../utils/web3';
import ipfs from '../utils/ipfs';

const CancelBooking = () => {
    const [roomId, setRoomId] = useState(''); // 방 ID 상태
    const [account, setAccount] = useState(''); // 계정 상태
    const [password, setPassword] = useState(''); // 패스워드 상태
    const [refundAmount, setRefundAmount] = useState(BigInt(0)); // 환불 금액 상태
    const navigate = useNavigate(); // useNavigate 훅 사용

    useEffect(() => {
        // Fetch account and setup contract when component mounts
        const init = async () => {
            await setupContract(); // 스마트 계약 초기화
            const accounts = await web3.eth.getAccounts(); // 사용자의 계정 가져오기
            setAccount(accounts[0]); // 첫 번째 계정 설정
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

            // IPFS에서 사용자 정보 가져오기
            const ipfsHash = roomBooking.ipfsHash;
            let fileContent = '';
            for await (const chunk of ipfs.cat(ipfsHash)) {
                fileContent += new TextDecoder("utf-8").decode(chunk);
            }

            // JSON 형식인지 확인
            try {
                const userInfo = JSON.parse(fileContent);
                console.log("User Info: ", userInfo);

                // 패스워드 검증
                if (userInfo.password !== password) {
                    alert('Incorrect password. Cancellation not allowed.');
                    return;
                }

                const bookingTime = BigInt(roomBooking.bookingTime);
                const price = BigInt((await hotelBooking.methods.rooms(roomId).call()).price);
                console.log("Room Price:", price);

                const elapsed = BigInt(Math.floor(Date.now() / 1000)) - bookingTime;
                let refundPercentage = BigInt(0);

                // 경과 시간에 따른 환불 비율 설정
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
                navigate('/'); // 예약 취소 후 메인 페이지로 리디렉션

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
        <div>
            <h2>Cancel Booking</h2>
            <input type="number" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)} // 패스워드 입력 처리
            />
            <button onClick={handleCancel}>Cancel</button>
            {refundAmount > BigInt(0) && ( // Check for BigInt zero
                <p>Refund Amount: {web3.utils.fromWei(refundAmount.toString(), 'ether')} ETH</p>
            )}
        </div>
    );
};

export default CancelBooking;
