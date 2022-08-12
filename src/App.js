import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/IzineyBank.json";
import Web3Modal from "web3modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    deposit: "",
    bankName: "",
  });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = "0x20420687c53Ee0C9A508F2a43c0cf568929a87d5";
  const contractABI = abi.abi;

  const connectGoerli = () => {
    toast("Connect Ethereum Testnet Goerli", {
      icon: "📢",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
    });
  };

  const nWalletNotConnect = () => {
    toast.error("Wallet not connect, try again!", {
      icon: "⛔",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
    });
  };
  const nSuccessDeposit = () => {
    toast.success("Success Deposit!", {
      icon: "✅",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false
    });
  };
  const nErrorDeposit = () => {
    toast.success("Failed deposit!, try again", {
      icon: "⛔",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
    });
  };
  const nSuccessWithdraw = () => {
    toast.success("Success Withdraw!", {
      icon: "✅",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false
    });
  };
  const nErrorWithdraw = () => {
    toast.success("Failed withdrawal!, try again", {
      icon: "⛔",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
    });
  };
  
  const nWelcomeAdmin = () => {
    toast.success("Welcome Admin Bank", {
      icon: "👮🏻‍♂️",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false
    });
  };
  const nWelcomeUser = () => {
    toast.success("Welcome to Iziney Bank", {
      icon: "❤",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
    });
  };

  const providerOptions = {
    binancechainwallet: {
      package: true,
    },
  };

  const web3Modal = new Web3Modal({
    network: "goerli",
    cacheProvider: true,
    providerOptions,
  });

  const checkIfWalletIsConnected = async () => {
    try {
      const instance = await web3Modal.connect();
      if (instance) {
        const provider = new ethers.providers.Web3Provider(instance);
        const accounts = await provider.listAccounts();
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
        nWelcomeUser();
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      nWalletNotConnect();
      console.log(error);
    }
  };

  const getBankName = async () => {
    try {
      const instance = await web3Modal.connect();
      if (instance) {
        //read
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let bankName = await bankContract.bankName();
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setBankNameHandler = async (event) => {
    event.preventDefault();
    try {
      const instance = await web3Modal.connect();
      if (instance) {
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue.bankName)
        );
        console.log("Setting Bank Name...");
        await txn.wait();
        console.log("Bank Name Changed", txn.hash);
        getBankName();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getbankOwnerHandler = async () => {
    try {
      const instance = await web3Modal.connect();
      if (instance) {
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);
        nWelcomeAdmin();
        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const customerBalanceHandler = async () => {
    try {
      const instance = await web3Modal.connect();
      if (instance) {
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let balance = await bankContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      const instance = await web3Modal.connect();
      if (instance) {
        //write
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);
        customerBalanceHandler();
        nSuccessDeposit();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      nErrorDeposit();
      console.log(error);
    }
  };

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      const instance = await web3Modal.connect();
      if (instance) {
        const provider = new ethers.providers.Web3Provider(instance);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await bankContract.withDrawMoney(
          myAddress,
          ethers.utils.parseEther(inputValue.withdraw)
        );
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);
        customerBalanceHandler();
        nSuccessWithdraw();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      nErrorWithdraw();
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    customerBalanceHandler();
  }, [isWalletConnected]);

  return (
    <main className="main-container">
      <h2 className="headline">
        🏦
        <span className="headline-gradient">🏦 Iziney Bank</span>{" "}
      </h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ? (
            <p>"Setup the name of your bank." </p>
          ) : (
            <p className="text-3xl font-bold text-black">{currentBankName}</p>
          )}
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button className="btn-purple" onClick={deposityMoneyHandler}>
              💰 Deposit Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style "
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button className="btn-purple" onClick={withDrawMoneyHandler}>
              🤑 Withdraw Money In ETH
            </button>
          </form>
          <ToastContainer />
          {connectGoerli()}
        </div>
        <div className="mt-5">
          <p class="text-gray-700">
            <span className="font-bold text-black">💸 Client Balance: </span>
            {customerTotalBalance}
          </p>
        </div>
        <div className="mt-5">
          <p class="text-gray-700">
            <span className="font-bold text-black">
              👮🏻‍♂️ Bank Owner Address:{" "}
            </span>
            {bankOwnerAddress}
          </p>
        </div>
        <div className="mt-5">
          {isWalletConnected && (
            <p class="text-gray-700">
              <span className="font-bold text-black">
                ✨ Your Wallet Address:{" "}
              </span>
              {customerAddress}
            </p>
          )}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
          <ToastContainer />
        </div>
      </section>
      {isBankerOwner && (
        <section className="bank-owner-section">
          <h2 className="text-xl border-b-2 border-gray-500 px-10 py-4 font-bold">
            Bank Admin Panel
          </h2>
          <div className="p-10">
            <form className="form-style">
              <input
                type="text"
                className="input-style"
                onChange={handleInputChange}
                name="bankName"
                placeholder="Enter a Name for Your Bank"
                value={inputValue.bankName}
              />
              <button className="btn-grey" onClick={setBankNameHandler}>
                Set Bank Name
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
export default App;
