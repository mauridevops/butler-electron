import React from 'react';

import Input from '../../../../common/Input';

const CHANNEL = 'EMAIL';

const Email = ({ emailInfo, setChannelData }) => {
  const handleEmailEnabledOnChange = event => {
    event.persist();

    const {
      target: { checked },
    } = event;

    setChannelData(CHANNEL, 'enabled', checked);
  };

  const handleEmailDataOnChange = event => {
    event.persist();

    const {
      target: { name, value },
    } = event;

    setChannelData(CHANNEL, name, value);
  };

  return (
    <div className='email-wrapper'>
      <div className='email-checkbox-wrapper'>
        <Input type='checkbox' id='email' checked={emailInfo.enabled} onChange={handleEmailEnabledOnChange} />
        <label htmlFor='email' className='email-label'>
          Email
        </label>
      </div>
      {emailInfo.enabled && (
        <div className='email-info-wrapper'>
          <Input
            type='text'
            placeholder='Username'
            name='username'
            value={emailInfo.username}
            onChange={handleEmailDataOnChange}
          />
          <Input
            type='text'
            placeholder='Password'
            name='password'
            value={emailInfo.password}
            onChange={handleEmailDataOnChange}
          />
          <Input type='text' placeholder='From' name='from' value={emailInfo.from} onChange={handleEmailDataOnChange} />
          <Input type='text' placeholder='To' name='to' value={emailInfo.to} onChange={handleEmailDataOnChange} />
        </div>
      )}
    </div>
  );
};

export default Email;
