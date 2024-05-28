const HotelBooking = artifacts.require("HotelBooking");

module.exports = async function(deployer) {
    // HotelBooking 스마트 계약을 배포
    await deployer.deploy(HotelBooking);

    // 배포된 계약의 인스턴스를 가져오기
    const instance = await HotelBooking.deployed();

    // 방 추가
    await instance.addRoom("Deluxe Room", web3.utils.toWei("0.5", "ether"));
    await instance.addRoom("Standard Room", web3.utils.toWei("0.3", "ether"));
    await instance.addRoom("Super Deluxe Room", web3.utils.toWei("1.5", "ether"));
};
