import { useEffect, useState, useRef } from 'react';
import { useWeb3React } from "@web3-react/core";
import { formatEther } from "@ethersproject/units";
import Modal from 'react-modal';
import Web3 from 'web3';
import { trackPromise } from 'react-promise-tracker';

import { injected, walletconnect } from "./utils/connector";
import WalletConnect from './WalletConnect/WalletConnect';
import Spinner from './Spinner/Spinner';

import './App.css';

const customStyles = {
  content: {
    with: '500px',
    height: '300px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    borderRadius: '20px',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

function App() {

  // set up block listener 
  const web3Instance = useRef();
  const [, setBlockNumber] = useState();
  const [ethBalance, setEthBalance] = useState();
  const { active, chainId, library, account, activate } = useWeb3React();

  const [earnvalue, setearnvalue] = useState();
  const [sharedPool, setsharedPool] = useState();
  const [stakevalue, setstakevalue] = useState();
  const [staketotal, setstaketotal] = useState();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [isApproval, setIsApproval] = useState(false);

  const [dataModal, setDataModal] = useState({
    title: 'withdraw',
    value: null,
    displayvalue: 0
  })


  // smart contracts
  const WETH_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }]
  const WETH_ADDRESS = '0xc778417e063141139fce010982780140aa0cd5ab';

  const DD2_ABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
  const DD2_ADDRESS = '0xb1745657CB84c370DD0Db200a626d06b28cc5872';

  const Masterchef_ABI = [{ "inputs": [{ "internalType": "contract DD2Token", "name": "_dd2", "type": "address" }, { "internalType": "uint256", "name": "_dd2PerBlock", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EmergencyWithdraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "dd2", "outputs": [{ "internalType": "contract DD2Token", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "dd2PerBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" }], "name": "getBlocks", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "pendingDD2", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "updatePool", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userInfo", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "weth", "outputs": [{ "internalType": "contract IWETH", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
  const Masterchef_ADDRESS = '0x9da687e88b0A807e57f1913bCD31D56c49C872c2';

  useEffect(() => {
    if (library) {
      let stale = false;
      library
        .getBlockNumber()
        .then(blockNumber => {
          if (!stale) {
            setBlockNumber(blockNumber);
          }
        })
        .catch(() => {
          if (!stale) {
            setBlockNumber(null);
          }
        });

      const updateBlockNumber = blockNumber => {
        setBlockNumber(blockNumber);
      };
      library.on("block", updateBlockNumber);

      return () => {
        library.removeListener("block", updateBlockNumber);
        stale = true;
        setBlockNumber(undefined);
      };
    }
  }, [library, chainId]);

  useEffect(() => {
    if (library && account) {
      let stale = false;

      library
        .getBalance(account)
        .then(balance => {
          if (!stale) {
            setEthBalance(balance);
          }
        })
        .catch(() => {
          if (!stale) {
            setEthBalance(null);
          }
        });

      const web3 = new Web3(window.web3.currentProvider);
      web3Instance.current = web3;

      // get account info
      getVestingInfos();

      return () => {
        stale = true;
        setEthBalance(undefined);
      };

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library, account, chainId]);


  const handleConnect = (wallet) => {
    switch (wallet) {
      case 'metamask':
        activate(injected)
        break;
      case 'walletconnect':
        activate(walletconnect)
        break;
      default:
        break;
    }
  }

  const handleSubmitModal = async () => {
    setIsOpen(false);
    if (isNaN(dataModal.value)) {
      return;
    }
    const masterChefSC = new web3Instance.current.eth.Contract(Masterchef_ABI, Masterchef_ADDRESS);

    // stake
    if (dataModal.title === 'stake') {
      try {
        await trackPromise(masterChefSC.methods.deposit(dataModal.value).send({ from: account }));
      } catch (error) {
        console.log(error);
      }
      return;
    }

    // withdraw
    if (dataModal.title === 'withdraw') {
      try {
        await trackPromise(masterChefSC.methods.withdraw(Number(dataModal.value)).send({ from: account }));
      } catch (error) {
        console.log(error);
      }
    }

    await trackPromise(getVestingInfos());
  }

  const handleApproval = async () => {
    try {
      const wethSmartContract = new web3Instance.current.eth.Contract(WETH_ABI, WETH_ADDRESS);
      await trackPromise(wethSmartContract.methods.approve(Masterchef_ADDRESS, 5000 * 10 ^ 6).call());
      setIsApproval(true);
    } catch (error) {
      console.log(error);
    }
  }

  const hanleOpenOpen = (type) => {
    setIsOpen(true);

    let displayValue = type === 'stake'
      ? parseFloat(formatEther(ethBalance)).toPrecision(4)
      : 0;
    setDataModal({
      displayvalue: displayValue,
      title: type,
      value: 0
      ,
    })
  }

  const getVestingInfos = async () => {
    try {
      const masterChefSC = new web3Instance.current.eth.Contract(Masterchef_ABI, Masterchef_ADDRESS);
      const DD2SmartContract = new web3Instance.current.eth.Contract(DD2_ABI, DD2_ADDRESS);
      const WETHSmartContract = new web3Instance.current.eth.Contract(WETH_ABI, WETH_ADDRESS);

      // get reward balance of balance
      const dd2Balance = await DD2SmartContract.methods.balanceOf(account).call();
      setearnvalue(parseFloat(dd2Balance));

      // get vesting informations
      const userInfo = await masterChefSC.methods.userInfo(account).call();
      setstakevalue(parseFloat(userInfo.amount));

      // get WETH balance of Masterchef hold
      const balanceOf = await WETHSmartContract.methods.balanceOf(Masterchef_ADDRESS).call();
      setstaketotal(parseFloat(Web3.utils.fromWei(balanceOf, 'ether')).toFixed(2));

      // get percent shared of pool
      let percent = (parseFloat(userInfo.amount) / parseFloat(balanceOf)) * 100;
      setsharedPool(percent);

    } catch (error) {
      console.log(error)
    }
  }

  const hanleHavest = async () => {
    try {
      const web3 = new Web3(window.web3.currentProvider);
      const masterChefSC = new web3.eth.Contract(Masterchef_ADDRESS, Masterchef_ABI);
      await trackPromise(masterChefSC.methods.updatePool().call());
      await trackPromise(getVestingInfos());
    } catch (error) {
      console.log(error);
    }
  }

  const renderAccountInfo = () => {
    return (
      <div className="wallet-info">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            lineHeight: "2rem"
          }}
        >
          <div className="left">
            <span>Wallet: </span>
            <span>
              {account === undefined
                ? "..."
                : account === null
                  ? "None"
                  : `${account.substring(0, 6)}...${account.substring(
                    account.length - 4
                  )}`}
            </span>
          </div>

          <div className="right">
            <span>Balance: </span>
            <span>
              {ethBalance === undefined
                ? "..."
                : ethBalance === null
                  ? "Error"
                  : `${parseFloat(formatEther(ethBalance)).toPrecision(4)} ETH`}
            </span>
          </div>
        </div>

        <div className="Stake__token">
          <div style={{ width: '100%', textAlign: 'left', paddingLeft: '10px' }}>Stake Token</div>
          <div className="Stake__token-container">
            <span>Token earned: {earnvalue || 0} DD2</span>
            <button className="btn" onClick={hanleHavest}>Havest</button>
          </div>
        </div>

        <div className="Stake__actions">
          {
            !isApproval
              ? <div className="action">
                <button className="btn" onClick={handleApproval}>Approval</button>
              </div>
              : <div className="approval">
                <button className="btn" onClick={() => hanleOpenOpen('stake')}>Stake</button>
                <button className="btn" style={{ marginRight: '20px' }} onClick={() => hanleOpenOpen('withdraw')}>Withdraw</button>
              </div>
          }
        </div>

        <div className="Stake__pool-info">
          <div className="Stake__pool-info-row">
            <span>Shared of pool</span>
            <span>{sharedPool || 0} %</span>
          </div>

          <div className="Stake__pool-info-row">
            <span>Your Stake</span>
            <span>{stakevalue || 0} Token</span>
          </div>

          <div className="Stake__pool-info-row">
            <span>Total Stake</span>
            <span>{staketotal || 0} Token</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header" >Using web3js sample </header>
      <div className="wrapper-content">
        {
          active
            ? renderAccountInfo()
            : <WalletConnect handleConnected={handleConnect}></WalletConnect>
        }
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => { setIsOpen(false) }}
        style={customStyles}
      >

        <div className="modal-container">
          <span>{dataModal.title}</span>

          <div className="modal-input">
            <input placeholder="input here" className="input" value={dataModal.value} onChange={(e) => { setDataModal({ ...dataModal, value: e.target.value }) }}></input>
            <span className="label" onClick={() => {
              setDataModal({ ...dataModal, value: dataModal.displayvalue })
            }}>MAX</span>
          </div>

          {
            dataModal.title === 'stake'
              ? <span>Your balance {dataModal.displayvalue} WETH</span>
              : <span>Total staked: {dataModal.displayvalue} DD2</span>
          }
          <button className="btn-modal" onClick={handleSubmitModal}>Submit</button>
        </div>

      </Modal>
      <Spinner></Spinner>
    </div >
  );
}

export default App;
