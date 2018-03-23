import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import uniqBy from 'lodash/uniqBy';
import IndexPage from './IndexPage';
import ShowPage from './ShowPage';
import Footer from './Footer';
import Navigation from './Navigation';
import getWeb3 from './web3';

const contractAddressesForNetworkId = {
  1: '0xFd74f0ce337fC692B8c124c094c1386A14ec7901',
  3: '0xC5De286677AC4f371dc791022218b1c13B72DbBd',
  4: '0x6f32a6F579CFEed1FFfDc562231C957ECC894001',
  42: '0x139d658eD55b78e783DbE9bD4eb8F2b977b24153'
};

const contractAbi = [
  {
    constant: false,
    inputs: [{ name: 'data', type: 'string' }],
    name: 'post',
    outputs: [],
    payable: false,
    type: 'function'
  }
];

export default class App extends Component {
  state = {
    activeCat: undefined,
    myCats: [],
    catsInfo: JSON.parse(localStorage.getItem('catsInfo') || '[]'),
    allowPurr: false,
    purrs: [],
    temporaryPurrs: [],
    newPurrs: []
  };

  catInfoRequests = {};

  componentDidMount() {
    this.refreshWeb3State();
    setInterval(this.refreshWeb3State, 1000);
    this.refreshMyCats();
    setInterval(this.refreshMyCats, 15000);
  }

  refreshMyCats = async () => {
    const web3 = await getWeb3();
    const [from] = await web3.eth.getAccounts();
    if (!from) return;
    const response = await fetch(
      `https://api-dev.userfeeds.io/ranking/tokens;identity=${from.toLowerCase()};asset=ethereum:0x06012c8cf97bead5deae237070f9587f8e7a266d`
    );
    const { items: myCats } = await response.json();
    this.setState({ myCats, activeCat: myCats[0] });
  };

  refreshWeb3State = async () => {
    const web3 = await getWeb3();
    const [[from], isListening] = await Promise.all([web3.eth.getAccounts(), web3.eth.net.isListening()]);
    this.setState({ allowPurr: !!(isListening && from) });
  };

  getCatInfo = catId => {
    if (this.state.catsInfo[catId] || this.catInfoRequests[catId]) return;
    this.catInfoRequests[catId] = fetch(`https://api.cryptokitties.co/kitties/${catId}`)
      .then(res => res.json())
      .then(catData => {
        this.setState({ catsInfo: { ...this.state.catsInfo, [catId]: catData } }, () => {
          delete this.catInfoRequests[catId];
          localStorage.setItem('catsInfo', JSON.stringify(this.state.catsInfo));
        });
      });
  };

  purr = async (message, { onTransactionHash }) => {
    const token = this.state.activeCat.token;
    const data = {
      claim: {
        target: message
      },
      context: `ethereum:0x06012c8cf97bead5deae237070f9587f8e7a266d:${token}`
    };
    const web3 = await getWeb3();
    const [networkId, [from]] = await Promise.all([web3.eth.net.getId(), web3.eth.getAccounts()]);
    const contractAddress = contractAddressesForNetworkId[networkId];
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    contract.setProvider(web3.currentProvider);
    let lastTransactionHash;
    return contract.methods
      .post(JSON.stringify(data))
      .send({ from })
      .on('transactionHash', async transactionHash => {
        lastTransactionHash = transactionHash;
        await onTransactionHash();
        const tempPurr = {
          author: from,
          created_at: new Date().getTime(),
          id: `claim:${transactionHash}:0`,
          message,
          sequence: (await web3.eth.getBlockNumber()) + 1,
          token_id: token
        };
        this.addTemporaryPurr(tempPurr);
      })
      .on('error', () => {
        this.removeTemporaryPurr(`claim:${lastTransactionHash}:0`);
      });
  };

  addTemporaryPurr = purr => {
    this.setState({ temporaryPurrs: [purr, ...this.state.temporaryPurrs] });
  };

  removeTemporaryPurr = purrId => {
    this.setState({ temporaryPurrs: this.state.temporaryPurrs.filter(tempPurr => tempPurr.id !== purrId) });
  };

  updatePurrs = (purrs, purge) => {
    const newState = purge || this.state.purrs.length === 0 ? { purrs } : { newPurrs: purrs };
    this.setState(newState);
  };

  showNewPurrs = () => {
    this.setState({ purrs: this.state.newPurrs });
  };

  changeActiveCatToNext = () => {
    const { myCats, activeCat } = this.state;
    const currentCatIndex = myCats.indexOf(activeCat);
    const nextCat = currentCatIndex === myCats.length - 1 ? myCats[0] : myCats[currentCatIndex + 1];
    this.setState({ activeCat: nextCat });
  };

  changeActiveCatToPrevious = () => {
    const { myCats, activeCat } = this.state;
    const currentCatIndex = myCats.indexOf(activeCat);
    const previousCat = currentCatIndex === 0 ? myCats[myCats.length - 1] : myCats[currentCatIndex - 1];
    this.setState({ activeCat: previousCat });
  };

  render() {
    const { changeActiveCatToPrevious, changeActiveCatToNext, getCatInfo, updatePurrs, purr, showNewPurrs } = this;
    const { activeCat, myCats, purrs, catsInfo, temporaryPurrs, newPurrs, allowPurr } = this.state;
    const allPurrs = uniqBy([...temporaryPurrs, ...purrs], purr => purr.id);
    return (
      <Router>
        <React.Fragment>
          <div className="main">
            <Navigation activeCat={activeCat} myCats={myCats} />
            <Switch>
              <Route exact path="/cryptopurr/:catId">
                {props => {
                  const purrsForCat = allPurrs.filter(({ token_id }) => token_id === props.match.params.catId);
                  const newPurrsForCat = newPurrs.filter(({ token_id }) => token_id === props.match.params.catId);
                  const temporaryPurrsForCat = temporaryPurrs.filter(
                    ({ token_id }) => token_id === props.match.params.catId
                  );
                  return (
                    <ShowPage
                      {...props}
                      purr={purr}
                      purrs={purrsForCat}
                      newPurrsCount={newPurrsForCat.length - temporaryPurrsForCat.length - purrsForCat.length}
                      showNewPurrs={showNewPurrs}
                      allowPurr={allowPurr}
                      updatePurrs={updatePurrs}
                      myCats={myCats}
                      catsInfo={catsInfo}
                      getCatInfo={getCatInfo}
                    />
                  );
                }}
              </Route>
              <Route exact path="/cryptopurr">
                {props => (
                  <IndexPage
                    {...props}
                    purr={purr}
                    purrs={allPurrs}
                    newPurrsCount={newPurrs.length - temporaryPurrs.length - allPurrs.length}
                    updatePurrs={updatePurrs}
                    showNewPurrs={showNewPurrs}
                    allowPurr={allowPurr}
                    myCats={myCats}
                    activeCat={activeCat}
                    changeActiveCatToPrevious={changeActiveCatToPrevious}
                    changeActiveCatToNext={changeActiveCatToNext}
                    catsInfo={catsInfo}
                    getCatInfo={getCatInfo}
                  />
                )}
              </Route>
            </Switch>
          </div>
          <Footer />
        </React.Fragment>
      </Router>
    );
  }
}