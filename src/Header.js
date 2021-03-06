import React from 'react';
import Link, { A } from './Link';
import styled from 'styled-components';
import { ActiveEntityAvatar, ActiveEntityName, IfActiveEntity, Entities, EntityName, EntityAvatar } from './Entity';
import TranslationsContext from './Translations';
import Locked from './img/locked.svg';
import NoMetamask from './img/no.svg';
import NoIdentity from './img/noidentity.svg';
import Context from './Context';
import Logo from './Logo';

const StyledHeader = styled.div`
  background-color: #f9fbfd;
  border-bottom: 1px solid #e8e8f1;
  font-family: Rubik;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0;
  position: sticky;
  width: 100%;
  z-index: 999;
  height: 65px;
  top: 0;
  display: flex;
  align-items: center;
  padding: 0 2rem;

  @media (max-width: 770px) {
    padding: 0 0.75rem;
  }
`;

const TitleLink = styled(Link)`
  margin-left: 1rem;
  @media (max-width: 770px) {
    display: none;
  }
`;

const CrossLink = styled(A)`
  margin-left: 1rem;
  color: gray;
`;

const ButtonCrossLink = styled(CrossLink)`
  display: inline-block;
  padding: 5px 10px;
  background-color: rgba(246, 244, 255, 0.7);
  color: #623cea;
  border-radius: 3px;

  &:hover {
    background-color: #623cea;
    color: white !important;
  }
`;

const LinkContainer = styled.ul`
  display: flex;
  align-items: center;
  @media (max-width: 770px) {
    display: none;
  }
`;

const ToggleHttpButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  background-color: ${({http}) => http ? "#623cea" : "#fdcf0b"};
  border: none;
  border-radius: 3px;
  color: ${({http}) => http ? "white" : "#2f343a"};
`;

const Header = () => {
  return (
    <StyledHeader>
      <Link to="/">
        <Logo />
      </Link>
      <LinkDropdown />
      <LinkContainer>
        <TitleLink to="/">{process.env.REACT_APP_NAME}</TitleLink>
        <CrossLink href="https://userfeeds.github.io/cryptobeep">Beep</CrossLink>
        <CrossLink href="https://userfeeds.github.io/cryptomoji">Moji</CrossLink>
        <CrossLink href="https://userfeeds.github.io/robohash-book">Hash</CrossLink>
        <CrossLink href="http://story.digitalartchain.com/">Art</CrossLink>
        <ButtonCrossLink href="https://github.com/userfeeds/cryptopurr">Fork it</ButtonCrossLink>
      </LinkContainer>
      <Context.Consumer>
        {({ appStore: { http, toggleHttpClaims } }) => (
          <ToggleHttpButton http={http} onClick={toggleHttpClaims}>{http ? 'Off Chain' : 'On Chain'}</ToggleHttpButton>
        )}
      </Context.Consumer>
      <IfActiveEntity then={() => <CatDropdown />} other={<ErrorStatus />} />
    </StyledHeader>
  );
};

export default Header;

const DropdownEntityName = styled.div`
  margin-left: 12px;
  @media (max-width: 770px) {
    display: none;
  }
`;

const ToggleButton = styled.button`
  border: none;
  background: none;
  outline: none;
  cursor: pointer;
  margin-left: auto;
  position: relative;

  @media (max-width: 770px) {
    &:before {
      border-radius: 50%;
      background-color: white;
      box-shadow: 0 1px 4px 1px rgba(98, 60, 234, 0.2);
      z-index: 1;
      content: '▾';
      display: flex;
      width: 20px;
      height: 20px;
      font-size: 12px;
      color: rgb(98, 60, 234);
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%);
      align-items: center;
      justify-content: center;
    }
  }
`;

const CatDropdownToggle = ({ openDropdown }) => {
  return (
    <ToggleButton className="level" onClick={openDropdown}>
      <ActiveEntityAvatar size="small" />
      <DropdownEntityName>
        <b>
          <ActiveEntityName />
        </b>
        <span
          style={{
            display: 'inline-flex',
            fontSize: '1.6rem',
            position: 'relative',
            top: '-2px',
            lineHeight: '1px',
            marginLeft: '7px'
          }}
        >
          ⌄
        </span>
      </DropdownEntityName>
    </ToggleButton>
  );
};

const PickEntity = styled.button`
  border: none;
  background: none;
  outline: none;
  margin: 0;
  padding: 0.375rem 1rem;
  width: 100%;
  border-radius: 33px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f4f1ff;
    color: #623cea;
  }
`;

const CatDropdownContent = styled.ul`
  box-shadow: 0 10px 30px rgba(6, 3, 16, 0.06);
  border-radius: 25px 0 12px 25px;
  padding: 0.5rem;
  max-height: 50vh;
  overflow-y: scroll;
  margin: 0;
`;

const CatDropdown = () => {
  return (
    <div style={{ marginLeft: 'auto' }}>
      <Dropdown
        Content={CatDropdownContent}
        toggle={({ openDropdown }) => <CatDropdownToggle openDropdown={openDropdown} />}
        position="right"
      >
        {({ closeDropdown }) => (
          <Entities>
            {({ entities, changeActiveEntityTo }) =>
              entities.map(entity => (
                <li className="dropdown-item" style={{ padding: 0, minWidth: '11rem' }} key={entity.id}>
                  <PickEntity
                    onClick={() => {
                      changeActiveEntityTo(entity);
                      closeDropdown();
                    }}
                  >
                    <EntityAvatar id={entity.id} size="small" lazy={false} />
                    <b style={{ marginLeft: '5px' }}>
                      <EntityName id={entity.id} />
                    </b>
                  </PickEntity>
                </li>
              ))
            }
          </Entities>
        )}
      </Dropdown>
    </div>
  );
};

const DropdownLink = styled(CrossLink)`
  padding: 10px;
  margin: 0;
  min-width: 5rem;
`;

const DropdownButtonCrossLink = styled(ButtonCrossLink)`
  margin: 0;
  background-color: unset;
  min-width: 5rem;
`;

const LinkDropdownContent = styled.ul`
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(6, 3, 16, 0.06);
  border-radius: 12px;
  margin: 0;
  padding: 0.5rem;
  max-height: 50vh;
  overflow-y: scroll;
`;

const LinkDropdownContainer = styled.div`
  margin-left: 10px;
  display: none;
  @media (max-width: 770px) {
    display: flex;
  }
`;

const LinkDropdownToggle = styled.button`
  font-size: 0.9rem;
  background: none;
  border: none;
  outline: none;
  font-family: Rubik;
`;

const LinkDropdown = () => (
  <LinkDropdownContainer>
    <Dropdown
      Content={LinkDropdownContent}
      toggle={({ openDropdown }) => (
        <LinkDropdownToggle onClick={openDropdown}>
          More <span style={{ position: 'relative', top: '-2px' }}>⌄</span>
        </LinkDropdownToggle>
      )}
      position="left"
    >
      {() => (
        <React.Fragment>
          <DropdownLink href="https://userfeeds.github.io/cryptobeep">Beep</DropdownLink>
          <DropdownLink href="https://userfeeds.github.io/cryptomoji">Moji</DropdownLink>
          <DropdownLink href="https://userfeeds.github.io/robohash-book">Hash</DropdownLink>
          <DropdownLink href="http://story.digitalartchain.com/">Art</DropdownLink>
          <DropdownButtonCrossLink href="https://github.com/userfeeds/cryptopurr">Fork it</DropdownButtonCrossLink>
        </React.Fragment>
      )}
    </Dropdown>
  </LinkDropdownContainer>
);

class Dropdown extends React.Component {
  state = {
    active: false
  };

  componentWillUnmount() {
    this.closeDropdown();
  }

  openDropdown = e => {
    e.stopPropagation();
    this.setState({ active: true }, () => {
      window.addEventListener('click', this.onWindowClick);
      window.addEventListener('touchstart', this.onWindowClick);
    });
  };

  closeDropdown = () => {
    this.setState({ active: false });
    window.removeEventListener('click', this.onWindowClick);
    window.removeEventListener('touchstart', this.onWindowClick);
  };

  onWindowClick = event => {
    if (event.target !== this.dropdownElement && !this.dropdownElement.contains(event.target) && this.state.active) {
      this.closeDropdown();
    }
  };

  get dropdownMenuPosition() {
    return this.props.position === 'left' ? { left: 0, right: 'auto' } : { left: 'auto', right: 0 };
  }

  render() {
    return (
      <div className={`dropdown ${this.state.active ? 'is-active' : ''}`}>
        <div className="dropdown-trigger">{this.props.toggle({ openDropdown: this.openDropdown })}</div>
        <div
          className="dropdown-menu"
          ref={dropdown => (this.dropdownElement = dropdown)}
          style={{ ...this.dropdownMenuPosition, minWidth: 'unset' }}
        >
          <this.props.Content className="dropdown-content">
            {this.props.children({ closeDropdown: this.closeDropdown })}
          </this.props.Content>
        </div>
      </div>
    );
  }
}

const Error = styled.span`
  color: #fc0035;
  text-shadow: 0 0 10px rgba(252, 0, 53, 0.3);
  @media (max-width: 770px) {
    display: none;
  }
`;

const NoMetamaskStatus = () => (
  <ErrorContainer>
    <img src={NoMetamask} alt="No metamask" />
    <Error>No Metamask</Error>
  </ErrorContainer>
);

const MetamaskLockedStatus = () => (
  <ErrorContainer>
    <img src={Locked} alt="Metamask locked" />
    <Error>Metamask locked</Error>
  </ErrorContainer>
);

const NoIdentitiesStatus = () => (
  <ErrorContainer>
    <img src={NoIdentity} style={{ marginRight: '10px' }} alt="No Identities found" />
    <Error>
      <TranslationsContext.Consumer>{({ noEntitiesError }) => noEntitiesError}</TranslationsContext.Consumer>
    </Error>
  </ErrorContainer>
);

const ErrorContainer = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const ErrorStatus = () => {
  const renderStatus = (provider, from) => {
    if (!provider) {
      return <NoMetamaskStatus />;
    } else if (!from) {
      return <MetamaskLockedStatus />;
    } else {
      return <NoIdentitiesStatus />;
    }
  };
  return <Context.Consumer>{({ web3Store: { provider, from } }) => renderStatus(provider, from)}</Context.Consumer>;
};
