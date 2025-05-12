import { getContracts, getCurrentAccount, shortenAddress } from './app.js';
import { ethers } from "./ethers-5.6.esm.min.js";

// 加载项目列表
export async function loadProjects() {
    try {
        const contracts = await getContracts();
        const projectCount = await contracts.lending.projectCount();
        
        console.log(`找到 ${projectCount} 个项目`);
        
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = '';
        
        if (projectCount == 0) {
            projectsContainer.innerHTML = '<p class="text-center">暂无项目，请返回<a href="demo.html">演示面板</a>创建项目。</p>';
            return;
        }
        
        // 遍历所有项目
        for (let i = 0; i < projectCount; i++) {
            const projectInfo = await contracts.lending.getProjectInfo(i);
            
            // 创建项目卡片
            const projectCard = createProjectCard(i, projectInfo);
            projectsContainer.appendChild(projectCard);
        }
    } catch (error) {
        console.error("加载项目失败:", error);
        alert("加载项目时出错，请查看控制台了解详情。");
    }
}

// 创建项目卡片
function createProjectCard(projectId, projectInfo) {
    // 计算融资进度
    const amountRaised = ethers.utils.formatEther(projectInfo.amountRaised);
    const fundingGoal = ethers.utils.formatEther(projectInfo.fundingGoal);
    const progress = (amountRaised / fundingGoal) * 100;
    
    // 转换截止日期
    const deadline = new Date(projectInfo.deadline * 1000).toLocaleDateString();
    
    // 创建卡片元素
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // 设置卡片内容
    card.innerHTML = `
        <div class="project-image" style="background-image: url('images/project${projectId % 5 + 1}.jpg');"></div>
        <div class="project-content">
            <h3 class="project-title">${projectInfo.title}</h3>
            <div class="project-details">
                <p>${projectInfo.description}</p>
                <p>借款人: ${shortenAddress(projectInfo.borrower)}</p>
                <p>目标融资: ${fundingGoal} ETH | 已筹集: ${amountRaised} ETH</p>
                <p>截止日期: ${deadline}</p>
                <p>亏损率: ${projectInfo.lossPercentage}%</p>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%;"></div>
            </div>
            <div class="project-actions">
                <button class="btn invest-btn" data-project-id="${projectId}">投资项目</button>
                <a href="project-details.html?id=${projectId}" class="btn">查看详情</a>
            </div>
        </div>
    `;
    
    // 添加投资按钮点击事件
    const investBtn = card.querySelector('.invest-btn');
    investBtn.addEventListener('click', () => {
        showInvestmentModal(projectId, projectInfo.title);
    });
    
    return card;
}

// 显示投资模态框
function showInvestmentModal(projectId, projectTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>投资项目: ${projectTitle}</h2>
            <div class="form-group">
                <label class="form-label" for="investment-amount">投资金额 (ETH)</label>
                <input type="number" id="investment-amount" class="form-control" step="0.01" min="0.01" required>
            </div>
            <button id="submit-investment" class="btn">确认投资</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭按钮事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 提交投资事件
    const submitBtn = modal.querySelector('#submit-investment');
    submitBtn.addEventListener('click', async () => {
        const amountInput = modal.querySelector('#investment-amount');
        const amount = amountInput.value;
        
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert('请输入有效的投资金额');
            return;
        }
        
        await investInProject(projectId, amount);
        document.body.removeChild(modal);
    });
}

// 投资项目
async function investInProject(projectId, amount) {
    try {
        const contracts = await getContracts();
        
        // 转换为Wei
        const weiAmount = ethers.utils.parseEther(amount);
        
        // 调用合约
        const tx = await contracts.lending.investInProject(projectId, {
            value: weiAmount
        });
        
        // 等待交易确认
        await tx.wait();
        
        alert("投资成功!");
        
        // 重新加载项目列表
        loadProjects();
    } catch (error) {
        console.error("投资失败:", error);
        alert("投资失败，请查看控制台了解详情");
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
});