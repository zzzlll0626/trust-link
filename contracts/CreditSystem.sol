// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CreditSystem {
    // 用户信用结构
    struct CreditInfo {
        uint256 score;
        uint256 lastUpdated;
        uint256 transactionCount;
        uint256 defaultCount;
    }
    
    // 用户地址到信用信息的映射
    mapping(address => CreditInfo) public creditInfo;
    
    // 验证数据源
    mapping(address => bool) public authorizedSources;
    address public owner;
    
    // 事件
    event CreditScoreUpdated(address user, uint256 newScore);
    event DefaultRecorded(address user);
    event SourceAuthorized(address source);
    
    constructor() {
        owner = msg.sender;
    }
    
    // 仅限所有者修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // 仅限授权数据源修饰符
    modifier onlyAuthorizedSource() {
        require(authorizedSources[msg.sender], "Not an authorized data source");
        _;
    }
    
    // 授权数据源
    function authorizeSource(address _source) public onlyOwner {
        authorizedSources[_source] = true;
        emit SourceAuthorized(_source);
    }
    
    // 更新信用评分（仅限授权数据源调用）
    function updateCreditScore(address _user, uint256 _newScore) public onlyAuthorizedSource {
        require(_newScore <= 100, "Score must be between 0 and 100");
        
        CreditInfo storage info = creditInfo[_user];
        info.score = _newScore;
        info.lastUpdated = block.timestamp;
        
        emit CreditScoreUpdated(_user, _newScore);
    }
    
    // 记录用户违约
    function recordDefault(address _user) public onlyAuthorizedSource {
        CreditInfo storage info = creditInfo[_user];
        info.defaultCount++;
        
        // 违约后降低信用评分
        if (info.score >= 20) {
            info.score -= 20;
        } else {
            info.score = 0;
        }
        
        emit DefaultRecorded(_user);
        emit CreditScoreUpdated(_user, info.score);
    }
    
    // 增加交易计数
    function incrementTransactionCount(address _user) public onlyAuthorizedSource {
        creditInfo[_user].transactionCount++;
    }
    
    // 获取用户信用评分
    function getCreditScore(address _user) public view returns (uint256) {
        // 如果用户没有记录，返回默认评分50
        if (creditInfo[_user].lastUpdated == 0) {
            return 50;
        }
        return creditInfo[_user].score;
    }
}