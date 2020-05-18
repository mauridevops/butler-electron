import React, { useState, useEffect } from 'react';

import Input from '../../../../common/Input';
import QuestionTitle from '../../../../common/QuestionTitle';

import Emitter from '../../../../../utils/emitter';
import { getNetworkRegex } from '../../../../../utils/addressValidation';

import { useGetStateFromCP } from '../../../../../hooks/useGetStateFromCP';

import { REGEX_FOR_EMAIL, ERC20, WALLETS } from '../../../../../constants';

import './style.scss';

const WalletsSetup = ({ valid, selectedWallets, isButlerStarted, getState }) => {
  const [wallets, setWallets] = useState({});
  const [walletsToShow, setWalletsToShow] = useState([]);
  const [isValid, setIsValid] = useState();

  useGetStateFromCP(isButlerStarted, getState, { WALLETS: wallets });

  useEffect(() => {
    if (valid) {
      setIsValid(valid);
    }
  }, [valid]);

  useEffect(() => {
    for (const wallet in wallets) {
      if (!new RegExp(getNetworkRegex(wallet)).test(wallets[wallet].address) || !wallets[wallet].secret) {
        setIsValid(false);
        return;
      }
    }

    setIsValid(true);
  }, [wallets]);

  useEffect(() => {
    setWallets({});

    walletsToShow.forEach(wallet => {
      setWallets(wallets => ({
        ...wallets,
        ...{
          [wallet]: {
            address: wallets[wallet]?.address || selectedWallets?.[wallet]?.ADDRESS || '',
            secret: wallets[wallet]?.secret || selectedWallets?.[wallet]?.SECRET || '',
          },
        },
      }));
    });
  }, [walletsToShow]);

  useEffect(() => {
    if (!selectedWallets) return;

    setIsValid(true);

    Object.keys(selectedWallets).forEach(wallet => {
      const { ADDRESS, SECRET } = selectedWallets[wallet];

      setWallets(wallets => ({
        ...wallets,
        [wallet]: {
          address: ADDRESS,
          secret: SECRET,
        },
      }));
    });
  }, [selectedWallets]);

  new Emitter().on('onPairAdded', payload => {
    const uniqueWallets = new Set();

    Object.keys(payload).forEach(key => {
      const [provide, receive] = key.split('-');

      uniqueWallets.add(WALLETS[provide]);
      uniqueWallets.add(WALLETS[receive]);
    });

    setWalletsToShow([...uniqueWallets]);
  });

  const handleAddressOnChange = (wallet, event) => {
    event.persist();

    setWallets(wallets => ({
      ...wallets,
      [wallet]: { ...wallets[wallet], address: event.target.value },
    }));
  };

  const handleSecretOnChange = (wallet, event) => {
    event.persist();

    setWallets(wallets => ({
      ...wallets,
      [wallet]: { ...wallets[wallet], secret: event.target.value },
    }));
  };

  return (
    <div className='wallets-wrapper'>
      <QuestionTitle isValid={isValid} title='Wallet Setup' />
      {walletsToShow &&
        walletsToShow.map((wallet, idx) => {
          return (
            <div className='wallet-row' key={idx}>
              <div className='wallet'>
                {/* <img src={require(`../../../../../images/tokens/${wallet}.svg`)} alt={wallet} /> */}
                <label htmlFor={wallet}>{wallet}</label>
              </div>

              {wallets[wallet] && (
                <div className='wallet-info-wrapper'>
                  <div className='wallet-address'>
                    <Input
                      type='text'
                      placeholder='Address'
                      value={wallets[wallet]?.address}
                      onChange={event => handleAddressOnChange(wallet, event)}
                      name='address'
                    />
                    {!new RegExp(getNetworkRegex(wallet)).test(wallets[wallet]?.address) && (
                      <p className='errorMsg'>Enter valid {wallet} address</p>
                    )}
                  </div>
                  <div className='wallet-private-key'>
                    <Input
                      type='text'
                      placeholder='Private Key'
                      value={wallets[wallet]?.secret}
                      onChange={event => handleSecretOnChange(wallet, event)}
                      name='privateKey'
                      wrapperClassName='wallet-input-wrapper'
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default WalletsSetup;
