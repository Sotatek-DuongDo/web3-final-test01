import metamaskconnectsvg from './metamask.svg';
import walletconnectsvg from './walletconnect.svg';
import './WalletConnect.css';

const WalletConnect = ({ handleConnected }) => {
    return (
        <div className="connect-wrapper">
            <div className="btn-connect" onClick={() => handleConnected('metamask')}>
                <img className="icon" src={metamaskconnectsvg} alt=""></img>
                <span className="span">Metamask</span>
            </div>
            <div className="btn-connect mt20" onClick={() => handleConnected('walletconnect')}>
                <img className="icon" src={walletconnectsvg} alt=""></img>
                <span className="span">Wallet connect</span>
            </div>
        </div>
    )
};

export default WalletConnect;
