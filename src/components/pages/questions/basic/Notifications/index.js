import React, { useState, useEffect } from 'react';

import QuestionTitle from '../../../../common/QuestionTitle';
import Input from '../../../../common/Input';
import Button from '../../../../common/Button';

import { useButlerConfig, useConfig } from '../../../../../context/ConfigContext';
import { REGEX_FOR_EMAIL } from '../../../../../constants';

import './style.scss';

const Notifications = () => {
  const [, updateConfig] = useButlerConfig();
  const emailConfig = useConfig('NOTIFICATIONS', 'EMAIL');
  const [enabled, toggleEnabled] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const handleEmailDataOnChange = event => {
    event.persist && event.persist();

    const {
      target: { name, value },
    } = event;

    updateConfig({ NOTIFICATIONS: { EMAIL: { ...emailConfig, [name]: value } } });
  };

  useEffect(() => {
    if (enabled) {
      const valid =
        emailConfig.PASSWORD &&
        new RegExp(REGEX_FOR_EMAIL).test(emailConfig.USERNAME) &&
        new RegExp(REGEX_FOR_EMAIL).test(emailConfig.FROM) &&
        new RegExp(REGEX_FOR_EMAIL).test(emailConfig.TO);
      setIsValid(valid);
    }
  }, [enabled, emailConfig]);

  return (
    <div className='notifications-wrapper'>
      <QuestionTitle isValid={isValid} title='Notifications' />
      <div>
        <div className={'email-checkbox-wrapper'}>
          <input id='open-email-data' type='checkbox' onChange={() => toggleEnabled(!enabled)} />
          <label htmlFor='open-email-data'>Email</label>
        </div>

        <div className='email-info-wrapper'>
          <div>
            <Input
              type='text'
              text='Username'
              name='USERNAME'
              value={emailConfig.USERNAME}
              onChange={handleEmailDataOnChange}
              disabled={!enabled}
            />
          </div>

          <div>
            <Input
              type='password'
              text='Password'
              name='PASSWORD'
              value={emailConfig.PASSWORD}
              onChange={handleEmailDataOnChange}
              disabled={!enabled}
            />
          </div>

          <div>
            <Input
              type='text'
              text='From'
              name='FROM'
              value={emailConfig.FROM}
              onChange={handleEmailDataOnChange}
              disabled={!enabled}
            />
          </div>

          <div>
            <Input
              type='text'
              text='To'
              name='TO'
              value={emailConfig.TO}
              onChange={handleEmailDataOnChange}
              disabled={!enabled}
            />

            <Button
              disabled={!isValid}
              content='Add'
              name='ENABLED'
              onClick={event => handleEmailDataOnChange({ ...event, target: { name: 'ENABLED', value: true } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
