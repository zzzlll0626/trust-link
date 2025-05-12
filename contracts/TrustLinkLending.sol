// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustLinkLending {
    // 项目结构
    struct Project {
        address borrower;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint256 deadline;
        uint256 collateralAmount;
        uint256 lossPercentage;
        bool isOpen;
        mapping(address => uint256) investments;
    }
    
    // 项目ID到项目的映射
    mapping(uint256 => Project) public projects;
    uint256 public projectCount = 0;
    
    // 平台费率 (2%)
    uint256 public platformFeeRate = 2;
    
    // 事件
    event ProjectCreated(uint256 projectId, address borrower, string title, uint256 fundingGoal);
    event ProjectFunded(uint256 projectId, address investor, uint256 amount);
    event CollateralWithdrawn(uint256 projectId, address borrower, uint256 amount);
    event LossUpdated(uint256 projectId, uint256 lossPercentage);
    
    // 创建新项目
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _durationInDays
    ) public payable {
        // 要求至少20%的抵押品
        require(msg.value >= _fundingGoal * 20 / 100, "Collateral must be at least 20% of funding goal");
        
        Project storage newProject = projects[projectCount];
        newProject.borrower = msg.sender;
        newProject.title = _title;
        newProject.description = _description;
        newProject.fundingGoal = _fundingGoal;
        newProject.deadline = block.timestamp + (_durationInDays * 1 days);
        newProject.collateralAmount = msg.value;
        newProject.isOpen = true;
        
        emit ProjectCreated(projectCount, msg.sender, _title, _fundingGoal);
        projectCount++;
    }
    
    // 投资项目
    function investInProject(uint256 _projectId) public payable {
        Project storage project = projects[_projectId];
        
        require(project.isOpen, "Project is not open for investment");
        require(block.timestamp < project.deadline, "Project funding deadline has passed");
        require(project.amountRaised + msg.value <= project.fundingGoal, "Investment would exceed funding goal");
        
        project.investments[msg.sender] += msg.value;
        project.amountRaised += msg.value;
        
        emit ProjectFunded(_projectId, msg.sender, msg.value);
    }
    
    // 更新项目亏损率
    function updateLossPercentage(uint256 _projectId, uint256 _lossPercentage) public {
        Project storage project = projects[_projectId];
        require(msg.sender == project.borrower, "Only borrower can update loss");
        
        project.lossPercentage = _lossPercentage;
        
        emit LossUpdated(_projectId, _lossPercentage);
    }
    
    // 获取项目信息
    function getProjectInfo(uint256 _projectId) public view returns (
        address borrower,
        string memory title,
        string memory description,
        uint256 fundingGoal,
        uint256 amountRaised,
        uint256 deadline,
        uint256 collateralAmount,
        uint256 lossPercentage,
        bool isOpen
    ) {
        Project storage project = projects[_projectId];
        return (
            project.borrower,
            project.title,
            project.description,
            project.fundingGoal,
            project.amountRaised,
            project.deadline,
            project.collateralAmount,
            project.lossPercentage,
            project.isOpen
        );
    }
    
    // 获取投资金额
    function getInvestmentAmount(uint256 _projectId, address _investor) public view returns (uint256) {
        return projects[_projectId].investments[_investor];
    }
}