// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DefaultHandler {
    // 投票结构
    struct Vote {
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool isActive;
        bool isExecuted;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votingPower;
    }
    
    // 项目ID到投票的映射
    mapping(uint256 => Vote) public votes;
    
    // 事件
    event VoteStarted(uint256 projectId, uint256 deadline);
    event VoteCast(uint256 projectId, address voter, bool inFavor, uint256 power);
    event VoteExecuted(uint256 projectId, bool continueProject);
    
    // 开始项目投票
    function startVote(uint256 _projectId, uint256 _durationInDays) public {
        Vote storage vote = votes[_projectId];
        require(!vote.isActive, "Voting already active");
        
        vote.deadline = block.timestamp + (_durationInDays * 1 days);
        vote.isActive = true;
        
        emit VoteStarted(_projectId, vote.deadline);
    }
    
    // 设置投票人的投票权重
    function setVotingPower(uint256 _projectId, address _voter, uint256 _power) public {
        Vote storage vote = votes[_projectId];
        vote.votingPower[_voter] = _power;
    }
    
    // 投票
    function castVote(uint256 _projectId, bool _inFavor) public {
        Vote storage vote = votes[_projectId];
        
        require(vote.isActive, "Voting not active");
        require(block.timestamp < vote.deadline, "Voting period ended");
        require(!vote.hasVoted[msg.sender], "Already voted");
        require(vote.votingPower[msg.sender] > 0, "No voting power");
        
        vote.hasVoted[msg.sender] = true;
        
        if (_inFavor) {
            vote.votesFor += vote.votingPower[msg.sender];
        } else {
            vote.votesAgainst += vote.votingPower[msg.sender];
        }
        
        emit VoteCast(_projectId, msg.sender, _inFavor, vote.votingPower[msg.sender]);
    }
    
    // 结束投票并执行结果
    function executeVote(uint256 _projectId) public {
        Vote storage vote = votes[_projectId];
        
        require(vote.isActive, "Voting not active");
        require(block.timestamp >= vote.deadline, "Voting still in progress");
        require(!vote.isExecuted, "Vote already executed");
        
        vote.isActive = false;
        vote.isExecuted = true;
        
        bool continueProject = vote.votesFor > vote.votesAgainst;
        
        emit VoteExecuted(_projectId, continueProject);
    }
    
    // 获取投票信息
    function getVoteInfo(uint256 _projectId) public view returns (
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool isActive,
        bool isExecuted
    ) {
        Vote storage vote = votes[_projectId];
        return (
            vote.votesFor,
            vote.votesAgainst,
            vote.deadline,
            vote.isActive,
            vote.isExecuted
        );
    }
    
    // 检查地址是否已投票
    function hasVoted(uint256 _projectId, address _voter) public view returns (bool) {
        return votes[_projectId].hasVoted[_voter];
    }
    
    // 获取地址的投票权重
    function getVotingPower(uint256 _projectId, address _voter) public view returns (uint256) {
        return votes[_projectId].votingPower[_voter];
    }
}