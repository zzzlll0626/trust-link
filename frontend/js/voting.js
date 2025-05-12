import { getContracts, getCurrentAccount } from './app.js';
import { ethers } from "./ethers-5.6.esm.min.js";

// 启动项目投票
export async function startProjectVote(projectId, durationInDays) {
    try {
        const contracts = await getContracts();
        
        // 调用合约启动投票
        const tx = await contracts.defaultHandler.startVote(projectId, durationInDays);
        await tx.wait();
        
        console.log(`为项目 ${projectId} 启动了投票，持续 ${durationInDays} 天`);
        
        // 设置当前用户的投票权重
        await setVotingPower(projectId);
        
        return true;
    } catch (error) {
        console.error("启动投票失败:", error);
        alert("启动投票失败: " + error.message);
        return false;
    }
}

// 设置投票权重（基于投资额）
async function setVotingPower(projectId) {
    try {
        const contracts = await getContracts();
        const currentAccount = getCurrentAccount();
        
        // 获取当前用户的投资额
        const investmentAmount = await contracts.lending.getInvestmentAmount(projectId, currentAccount);
        
        // 如果有投资，则设置对应的投票权重
        if (investmentAmount.gt(0)) {
            const tx = await contracts.defaultHandler.setVotingPower(projectId, currentAccount, investmentAmount);
            await tx.wait();
            console.log(`设置投票权重: ${ethers.utils.formatEther(investmentAmount)} ETH`);
        } else {
            // 如果没有投资，为演示设置默认权重
            const demoVotingPower = ethers.utils.parseEther("5");
            const tx = await contracts.defaultHandler.setVotingPower(projectId, currentAccount, demoVotingPower);
            await tx.wait();
            console.log(`设置演示投票权重: 5 ETH`);
        }
        
        return true;
    } catch (error) {
        console.error("设置投票权重失败:", error);
        return false;
    }
}

// 投票
export async function castVote(projectId, inFavor) {
    try {
        const contracts = await getContracts();
        const currentAccount = getCurrentAccount();
        
        // 检查是否已经投过票
        const hasVoted = await contracts.defaultHandler.hasVoted(projectId, currentAccount);
        if (hasVoted) {
            alert("您已经对此项目投过票了!");
            return false;
        }
        
        // 提交投票
        const tx = await contracts.defaultHandler.castVote(projectId, inFavor);
        await tx.wait();
        
        console.log(`投票提交成功: ${inFavor ? '继续' : '终止'} 项目 ${projectId}`);
        
        // 获取当前投票结果
        return await getVotingResults(projectId);
    } catch (error) {
        console.error("投票失败:", error);
        alert("投票失败: " + error.message);
        return null;
    }
}

// 获取投票结果
export async function getVotingResults(projectId) {
    try {
        const contracts = await getContracts();
        const voteInfo = await contracts.defaultHandler.getVoteInfo(projectId);
        
        return {
            votesFor: parseInt(voteInfo.votesFor.toString()),
            votesAgainst: parseInt(voteInfo.votesAgainst.toString()),
            deadline: new Date(parseInt(voteInfo.deadline.toString()) * 1000),
            isActive: voteInfo.isActive,
            isExecuted: voteInfo.isExecuted,
            result: voteInfo.votesFor.gt(voteInfo.votesAgainst) ? "继续" : "终止"
        };
    } catch (error) {
        console.error("获取投票结果失败:", error);
        return null;
    }
}