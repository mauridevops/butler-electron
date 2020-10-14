import React, { useCallback } from 'react';
import swal from 'sweetalert';

import Button from '../common/Button';

import { useButlerConfig } from '../../context/ConfigContext';
import { usePassword } from '../../context/PasswordContext';
import { useEvent } from '../../context/EventContext';
import { useHistory } from 'react-router-dom';

import { BUTLER_EVENTS } from '../../constants';
import { encrypt } from '../../utils/crypto';
import { sendFromRenderer } from '../../utils/electronAPI';

import CoinImage from '../../css/background-coins/Coins-button.svg';

import './_style.scss';

export default () => {
  const history = useHistory();
  const [password] = usePassword();
  const [config] = useButlerConfig();

  const handleEvent = useCallback(() => {
    sendFromRenderer(BUTLER_EVENTS.START, config);
  }, [config]);

  useEvent(BUTLER_EVENTS.DIED, handleEvent);

  const handleOnClick = () => {
    if (validateConfig(config)) {
      sendFromRenderer(BUTLER_EVENTS.START, config);
      sendFromRenderer(BUTLER_EVENTS.SAVE, encryptSecrets(config, password));
      history.push('/terminal');
    }
  };

  return (
    <Button
      color='red'
      className='start-button'
      content={
        <>
          <span>Start</span>
          <img src={CoinImage} alt='coin' />
        </>
      }
      onClick={handleOnClick}
    />
  );
};

const validateConfig = config => {
  if (!config.NAME) {
    swal({
      title: 'Wrong config',
      text: 'Plese provide `Butler name`',
      icon: 'error',
      dangerMode: true,
    });
    return false;
  }

  for (const asset in config.WALLETS) {
    const address = config.WALLETS[asset].ADDRESS;
    const secret = config.WALLETS[asset].SECRET;

    if (!address) {
      swal({
        title: 'Wrong config',
        text: `Plese provide ${asset} address`,
        icon: 'error',
        dangerMode: true,
      });
      return false;
    }

    if (!secret) {
      swal({
        title: 'Wrong config',
        text: `Plese provide ${asset} secret`,
        icon: 'error',
        dangerMode: true,
      });
      return false;
    }
  }

  if (config.NOTIFICATIONS?.EMAIL?.ENABLED) {
    const emailPassword = config.NOTIFICATIONS.EMAIL.PASSWORD;
    const username = config.NOTIFICATIONS.EMAIL.USERNAME;
    const from = config.NOTIFICATIONS.EMAIL.FROM;
    const to = config.NOTIFICATIONS.EMAIL.TO;

    if (!emailPassword || !username || !from || !to) {
      swal({
        title: 'Wrong config',
        text: `Plese provide email details or disable it`,
        icon: 'error',
        dangerMode: true,
      });
      return false;
    }
  }

  if (config.EXCHANGE?.NAME) {
    const apiKey = config.EXCHANGE.API_KEY;
    const secretKey = config.EXCHANGE.SECRET_KEY;

    if (!apiKey) {
      swal({
        title: 'Wrong config',
        text: `Plese provide ${config.EXCHANGE?.NAME} Api Key`,
        icon: 'error',
        dangerMode: true,
      });
      return false;
    }

    if (!secretKey) {
      swal({
        title: 'Wrong config',
        text: `Plese provide ${config.EXCHANGE?.NAME} Secret Key`,
        icon: 'error',
        dangerMode: true,
      });
      return false;
    }
  }

  if (!config.AGGREGATOR_URL) {
    swal({
      title: 'Wrong config',
      text: `Plese provide Aggregator Url`,
      icon: 'error',
      dangerMode: true,
    });
    return false;
  }

  if (!config.TRACKER_URL) {
    swal({
      title: 'Wrong config',
      text: `Plese provide Tracker Url`,
      icon: 'error',
      dangerMode: true,
    });
    return false;
  }

  if (!config.SERVER?.PORT) {
    swal({
      title: 'Wrong config',
      text: `Plese provide Server Port`,
      icon: 'error',
      dangerMode: true,
    });
    return false;
  }

  return true;
};

const encryptSecrets = (config, password) => {
  const encryptedConfig = { ...config };

  if (config.WALLETS) {
    for (const asset in config.WALLETS) {
      const secret = config.WALLETS[asset].SECRET;
      if (secret) {
        const result = encrypt(secret, password);
        if (result) {
          encryptedConfig.WALLETS[asset].SECRET = result;
          encryptedConfig.WALLETS[asset].ENCRYPTED = true;
        } else {
          throw new Error('ERROR_ENCRYPTING');
        }
      }
    }
  }

  if (config.NOTIFICATIONS?.EMAIL?.ENABLED) {
    const emailPassword = config.NOTIFICATIONS.EMAIL.PASSWORD;
    const result = encrypt(emailPassword, password);
    if (result) {
      encryptedConfig.NOTIFICATIONS.EMAIL.PASSWORD = result;
    } else {
      throw new Error('ERROR_ENCRYPTING');
    }
  }
  if (config.EXCHANGE?.API_KEY) {
    const exchangeApiKey = config.EXCHANGE.API_KEY;
    const result = encrypt(exchangeApiKey, password);

    if (result) {
      encryptedConfig.EXCHANGE.API_KEY = result;
    } else {
      throw new Error('ERROR_ENCRYPTING');
    }
  }

  if (config.EXCHANGE?.SECRET_KEY) {
    const exchangeSecretKey = config.EXCHANGE.SECRET_KEY;
    const result = encrypt(exchangeSecretKey, password);

    if (result) {
      encryptedConfig.EXCHANGE.SECRET_KEY = result;
    } else {
      throw new Error('ERROR_ENCRYPTING');
    }
  }

  return encryptedConfig;
};
