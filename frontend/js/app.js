import { ethers } from "./ethers-5.6.esm.min.js";

// 导入合约ABI
let lendingABI, creditABI, defaultHandlerABI, fundManagerABI;

// 全局状态
let provider = null;
let signer = null;
let currentAccount = null;
let contracts = null;

// 初始化应用
export async function initApp() {
    // 检查是否有Web3浏览器环境
    if (window.ethereum) {
        try {
            // 创建Web3提供者
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // 加载合约ABI
            await loadContractABIs();
            
            // 尝试自动连接
            if (window.ethereum.selectedAddress) {
                await connectWallet();
            }
            
            // 设置账户变化监听器
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    currentAccount = accounts[0];
                    await updateAccountInfo(currentAccount);
                } else {
                    currentAccount = null;
                    // 清空账户信息显示
                    const accountSection = document.getElementById('account-section');
                    if (accountSection) accountSection.style.display = 'none';
                }
            });
            
            return true;
        } catch (error) {
            console.error("初始化应用失败:", error);
            return false;
        }
    } else {
        alert("请安装MetaMask等Web3浏览器插件以使用此DApp!");
        return false;
    }
}

// 加载合约ABI
async function loadContractABIs() {
    try {
        const deploymentInfo = await fetch('./js/deployment.json').then(res => res.json());
        
        // 如果没有编译好的ABI，可以使用简化版ABI
        // 这里使用简化版ABI以便于直接复制使用
        lendingABI = [
            "function projectCount() view returns (uint256)",
            "function createProject(string memory _title, string memory _description, uint256 _fundingGoal, uint256 _durationInDays) payable",
            "function investInProject(uint256 _projectId) payable",
            "function getProjectInfo(uint256 _projectId) view returns (address borrower, string memory title, string memory description, uint256 fundingGoal, uint256 amountRaised, uint256 deadline, uint256 collateralAmount, uint256 lossPercentage, bool isOpen)",
            "function getInvestmentAmount(uint256 _projectId, address _investor) view returns (uint256)",
            "function updateLossPercentage(uint256 _projectId, uint256 _lossPercentage)"
        ];
        
        creditABI = [
            "function getCreditScore(address _user) view returns (uint256)",
            "function authorizeSource(address _source)",
            "function updateCreditScore(address _user, uint256 _newScore)",
            "function recordDefault(address _user)"
        ];
        
        defaultHandlerABI = [
            "function startVote(uint256 _projectId, uint256 _durationInDays)",
            "function setVotingPower(uint256 _projectId, address _voter, uint256 _power)",
            "function castVote(uint256 _projectId, bool _inFavor)",
            "function getVoteInfo(uint256 _projectId) view returns (uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool isActive, bool isExecuted)",
            "function hasVoted(uint256 _projectId, address _voter) view returns (bool)",
            "function getVotingPower(uint256 _projectId, address _voter) view returns (uint256)"
        ];
        
        fundManagerABI = [
            "function depositFunds() payable",
            "function getPoolStatus() view returns (uint256 total, uint256 available, uint256 allocated, uint256 reserve)",
            "function allocateFunds(uint256 _projectId, uint256 _amount)",
            "function collectFee(uint256 _amount, string memory _feeType)"
        ];
        
        // 保存部署信息以备后用
        window.deploymentInfo = deploymentInfo;
    } catch (error) {
        console.error("加载合约ABI失败:", error);
        alert("无法加载合约信息，请确保合约已部署并生成了deployment.json文件");
    }
}

// 连接钱包
export async function connectWallet() {
    try {
        // 请求用户授权
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 获取签名者
        signer = provider.getSigner();
        currentAccount = accounts[0];
        
        // 加载合约
        await loadContracts();
        
        console.log("钱包已连接:", currentAccount);
        
        // 返回账户地址
        return currentAccount;
    } catch (error) {
        console.error("连接钱包失败:", error);
        alert("连接钱包失败: " + error.message);
        return null;
    }
}

// 加载合约
async function loadContracts() {
    try {
        contracts = {
            lending: new ethers.Contract(
                window.deploymentInfo.lendingAddress,
                lendingABI,
                signer
            ),
            credit: new ethers.Contract(
                window.deploymentInfo.creditAddress,
                creditABI,
                signer
            ),
            defaultHandler: new ethers.Contract(
                window.deploymentInfo.defaultHandlerAddress,
                defaultHandlerABI,
                signer
            ),
            fundManager: new ethers.Contract(
                window.deploymentInfo.fundManagerAddress,
                fundManagerABI,
                signer
            )
        };
        
        console.log("合约已加载");
        
        // 将合约对象暴露给全局，方便调试
        window.contracts = contracts;
        
        return contracts;
    } catch (error) {
        console.error("加载合约失败:", error);
        alert("加载合约失败，请确保合约已正确部署");
        return null;
    }
}

// 更新账户信息
export async function updateAccountInfo(account) {
    const addressElement = document.getElementById('account-address');
    const balanceElement = document.getElementById('account-balance');
    
    if (addressElement) {
        addressElement.textContent = shortenAddress(account);
    }
    
    if (balanceElement) {
        try {
            const balance = await provider.getBalance(account);
            balanceElement.textContent = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        } catch (error) {
            console.error("获取余额失败:", error);
            balanceElement.textContent = "获取失败";
        }
    }
}

// 缩短地址显示
export function shortenAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// 导出合约相关功能
export async function getContracts() {
    if (!contracts) {
        await loadContracts();
    }
    return contracts;
}

// 导出当前账户
export function getCurrentAccount() {
    return currentAccount;
}

// 导出提供者和签名者
export function getProviderAndSigner() {
    return { provider, signer };
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);