import { getContracts, getCurrentAccount } from './app.js';
import { ethers } from "./ethers-5.6.esm.min.js";

// 创建演示项目
export async function createDemoProjects() {
    try {
        console.log("创建演示项目...");
        const contracts = await getContracts();
        
        // 项目1: MetaOffice空间
        let tx = await contracts.lending.createProject(
            "MetaOffice空间",
            "创建沉浸式虚拟办公环境，提升远程协作体验，支持VR互动与3D模型协作。",
            ethers.utils.parseEther("50"),
            30, // 30天
            { 
                value: ethers.utils.parseEther("10") // 20%抵押品
            }
        );
        await tx.wait();
        console.log("创建了项目1");
        
        // 项目2: 数字艺术NFT展馆
        tx = await contracts.lending.createProject(
            "数字艺术NFT展馆",
            "打造线上艺术展示平台，连接艺术家与收藏家，支持艺术品交易和展览。",
            ethers.utils.parseEther("80"),
            45, // 45天
            { 
                value: ethers.utils.parseEther("16") // 20%抵押品
            }
        );
        await tx.wait();
        console.log("创建了项目2");
        
        // 项目3: 元宇宙商业街区
        tx = await contracts.lending.createProject(
            "元宇宙商业街区",
            "构建虚拟商业区，为品牌提供元宇宙店铺空间，支持购物和社交互动。",
            ethers.utils.parseEther("120"),
            60, // 60天
            { 
                value: ethers.utils.parseEther("24") // 20%抵押品
            }
        );
        await tx.wait();
        console.log("创建了项目3");
        
        console.log("演示项目创建完成!");
        return true;
    } catch (error) {
        console.error("创建演示项目失败:", error);
        alert("创建演示项目失败: " + error.message);
        return false;
    }
}

// 初始化信用评分
export async function initializeCreditScore() {
    try {
        console.log("初始化信用评分...");
        const contracts = await getContracts();
        const currentAccount = getCurrentAccount();
        
        // 授权数据源（在实际应用中，这应该是安全的外部数据源）
        let tx = await contracts.credit.authorizeSource(currentAccount);
        await tx.wait();
        
        // 设置随机信用评分（示例）
        const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100之间
        tx = await contracts.credit.updateCreditScore(currentAccount, randomScore);
        await tx.wait();
        
        console.log(`初始化信用评分完成: ${randomScore}`);
        return true;
    } catch (error) {
        console.error("初始化信用评分失败:", error);
        alert("初始化信用评分失败: " + error.message);
        return false;
    }
}

// 初始化资金池
export async function initializeFundPool() {
    try {
        console.log("初始化资金池...");
        const contracts = await getContracts();
        
        // 存入初始资金
        const tx = await contracts.fundManager.depositFunds({
            value: ethers.utils.parseEther("50")
        });
        await tx.wait();
        
        console.log("资金池初始化完成!");
        return true;
    } catch (error) {
        console.error("初始化资金池失败:", error);
        alert("初始化资金池失败: " + error.message);
        return false;
    }
}

// 运行完整演示初始化
export async function runDemoInitialization() {
    try {
        await createDemoProjects();
        await initializeCreditScore();
        await initializeFundPool();
        
        return true;
    } catch (error) {
        console.error("演示初始化失败:", error);
        return false;
    }
}