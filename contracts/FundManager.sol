// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FundManager {
    // 状态变量
    address public owner;
    uint256 public totalFunds;
    uint256 public availableFunds;
    uint256 public allocatedFunds;
    uint256 public platformReserve;
    
    // 操作类型
    enum OperationType { Deposit, Withdrawal, Allocation, Fee }
    
    // 操作记录
    struct Operation {
        address operator;
        OperationType opType;
        uint256 amount;
        uint256 timestamp;
        string description;
    }
    
    // 操作历史
    Operation[] public operationHistory;
    
    // 事件
    event FundsDeposited(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event FundsAllocated(uint256 projectId, uint256 amount);
    event FeeCollected(uint256 amount, string feeType);
    
    constructor() {
        owner = msg.sender;
    }
    
    // 仅限所有者修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // 存入资金
    function depositFunds() public payable {
        totalFunds += msg.value;
        availableFunds += msg.value;
        
        // 记录操作
        operationHistory.push(Operation(
            msg.sender,
            OperationType.Deposit,
            msg.value,
            block.timestamp,
            "Pool deposit"
        ));
        
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    // 提取资金
    function withdrawFunds(address payable _recipient, uint256 _amount) public onlyOwner {
        require(_amount <= availableFunds, "Insufficient available funds");
        
        availableFunds -= _amount;
        totalFunds -= _amount;
        
        // 记录操作
        operationHistory.push(Operation(
            msg.sender,
            OperationType.Withdrawal,
            _amount,
            block.timestamp,
            "Pool withdrawal"
        ));
        
        _recipient.transfer(_amount);
        
        emit FundsWithdrawn(_recipient, _amount);
    }
    
    // 分配资金到项目
    function allocateFunds(uint256 _projectId, uint256 _amount) public onlyOwner {
        require(_amount <= availableFunds, "Insufficient available funds");
        
        availableFunds -= _amount;
        allocatedFunds += _amount;
        
        // 记录操作
        operationHistory.push(Operation(
            msg.sender,
            OperationType.Allocation,
            _amount,
            block.timestamp,
            string(abi.encodePacked("Allocation to project ", _projectId))
        ));
        
        emit FundsAllocated(_projectId, _amount);
    }
    
    // 收取平台费用
    function collectFee(uint256 _amount, string memory _feeType) public onlyOwner {
        require(_amount <= availableFunds, "Insufficient available funds");
        
        availableFunds -= _amount;
        platformReserve += _amount;
        
        // 记录操作
        operationHistory.push(Operation(
            msg.sender,
            OperationType.Fee,
            _amount,
            block.timestamp,
            string(abi.encodePacked("Fee collection: ", _feeType))
        ));
        
        emit FeeCollected(_amount, _feeType);
    }
    
    // 获取资金池状态
    function getPoolStatus() public view returns (
        uint256 total,
        uint256 available,
        uint256 allocated,
        uint256 reserve
    ) {
        return (totalFunds, availableFunds, allocatedFunds, platformReserve);
    }
    
    // 获取操作历史数量
    function getOperationCount() public view returns (uint256) {
        return operationHistory.length;
    }
    
    // 获取操作详情
    function getOperation(uint256 _index) public view returns (
        address operator,
        uint8 opType,
        uint256 amount,
        uint256 timestamp,
        string memory description
    ) {
        Operation storage op = operationHistory[_index];
        return (
            op.operator,
            uint8(op.opType),
            op.amount,
            op.timestamp,
            op.description
        );
    }
}